import Foundation
import Observation

@Observable
@MainActor
final class SearchModel {
    enum Phase: Equatable {
        case idle, loading, loaded, failed(String)
    }

    var query = ""
    var city = ""
    private(set) var phase: Phase = .idle
    private(set) var groups: [SalaryGroup] = []
    private(set) var total = 0
    private(set) var isSample = false
    private(set) var browseCompanies: [CompanyRef] = []

    var hasQuery: Bool { !trimmedQuery.isEmpty || !trimmedCity.isEmpty }
    private var trimmedQuery: String { query.trimmingCharacters(in: .whitespacesAndNewlines) }
    private var trimmedCity: String { city.trimmingCharacters(in: .whitespacesAndNewlines) }

    /// Changes whenever the inputs change; drives a debounced `.task(id:)` in the view.
    var searchKey: String { "\(trimmedQuery)|\(trimmedCity)" }

    func search(using api: APIClient) async {
        guard hasQuery else {
            groups = []
            total = 0
            phase = .idle
            return
        }
        phase = .loading
        do {
            let r = try await api.search(query: trimmedQuery, city: trimmedCity)
            try Task.checkCancellation()
            groups = r.groups
            total = r.total
            isSample = r.isSample
            phase = .loaded
        } catch is CancellationError {
            // A newer search replaced this one.
        } catch let error as URLError where error.code == .cancelled {
            // Same: the request was cancelled by a newer search.
        } catch {
            phase = .failed(error.localizedDescription)
        }
    }

    func loadBrowse(using api: APIClient) async {
        guard browseCompanies.isEmpty else { return }
        async let companies = api.suggestCompanies(prefix: "")
        async let meta = api.meta()
        browseCompanies = (try? await companies) ?? []
        isSample = (try? await meta)?.isSample ?? isSample
    }
}
