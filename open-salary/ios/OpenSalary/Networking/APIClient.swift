import Foundation
import Observation

/// Read-only client for the Open Salary public API. No keys, no accounts.
@Observable
final class APIClient {
    let baseURL: URL
    private let session: URLSession
    private let decoder = JSONDecoder()

    init(baseURL: URL, session: URLSession = .shared) {
        self.baseURL = baseURL
        self.session = session
    }

    /// Reads `OSAPIBaseURL` from Info.plist (set by the OS_API_BASE_URL build setting).
    static func fromBundle(_ bundle: Bundle = .main) -> APIClient {
        let raw = bundle.object(forInfoDictionaryKey: "OSAPIBaseURL") as? String
        let url = raw.flatMap(URL.init(string:)) ?? URL(string: "http://localhost:3000")!
        return APIClient(baseURL: url)
    }

    func search(query: String, city: String, limit: Int = 50) async throws -> SearchResponse {
        try await get("api/search", [
            URLQueryItem(name: "q", value: query),
            URLQueryItem(name: "city", value: city),
            URLQueryItem(name: "limit", value: String(limit)),
        ])
    }

    func company(slug: String) async throws -> CompanyResponse {
        try await get("api/companies/\(slug)")
    }

    func suggestCompanies(prefix: String) async throws -> [CompanyRef] {
        let r: CompanySuggestions = try await get("api/companies", [URLQueryItem(name: "prefix", value: prefix)])
        return r.companies
    }

    func meta() async throws -> Meta {
        try await get("api/meta")
    }

    private func get<T: Decodable>(_ path: String, _ query: [URLQueryItem] = []) async throws -> T {
        var components = URLComponents(url: baseURL.appending(path: path), resolvingAgainstBaseURL: false)!
        if !query.isEmpty { components.queryItems = query }
        let (data, response) = try await session.data(from: components.url!)
        guard let http = response as? HTTPURLResponse else { throw APIError.badResponse }
        guard (200..<300).contains(http.statusCode) else {
            throw http.statusCode == 404 ? APIError.notFound : APIError.http(http.statusCode)
        }
        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decoding(error)
        }
    }
}

enum APIError: LocalizedError {
    case badResponse, notFound, http(Int), decoding(Error)

    var errorDescription: String? {
        switch self {
        case .badResponse: "The server sent an unexpected response."
        case .notFound: "Not found."
        case .http(let code): "The server returned an error (\(code))."
        case .decoding: "The server's data couldn't be read. The app may need an update."
        }
    }
}
