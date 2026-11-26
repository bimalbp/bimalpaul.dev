import SwiftUI

struct SearchView: View {
    @Environment(APIClient.self) private var api
    @State private var model = SearchModel()
    @State private var showingAbout = false

    var body: some View {
        NavigationStack {
            List {
                if model.isSample {
                    SampleBanner()
                        .listRowSeparator(.hidden)
                }
                Section {
                    TextField("City (optional)", text: $model.city)
                        .textInputAutocapitalization(.words)
                        .autocorrectionDisabled()
                        .submitLabel(.search)
                }
                content
            }
            .listStyle(.plain)
            .navigationTitle("Open Salary")
            .searchable(text: $model.query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Company or job title")
            .autocorrectionDisabled()
            .task(id: model.searchKey) {
                // Debounce typing: a newer key cancels this task before the sleep ends.
                try? await Task.sleep(for: .milliseconds(300))
                guard !Task.isCancelled else { return }
                await model.search(using: api)
            }
            .task { await model.loadBrowse(using: api) }
            .refreshable { await model.search(using: api) }
            .navigationDestination(for: SalaryGroup.self) { GroupDetailView(group: $0) }
            .navigationDestination(for: CompanyRef.self) { CompanyView(company: $0) }
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("About the data", systemImage: "info.circle") { showingAbout = true }
                }
            }
            .sheet(isPresented: $showingAbout) { AboutView() }
        }
    }

    @ViewBuilder
    private var content: some View {
        if !model.hasQuery {
            Section {
                Text("See what jobs pay. Free.")
                    .font(.title2.bold())
                Text("Salary ranges from public filings and pay-transparent job postings. No account, no sign-in, no paywall, and every number links to its source.")
                    .foregroundStyle(.secondary)
            }
            .listRowSeparator(.hidden)
            if !model.browseCompanies.isEmpty {
                Section("Browse companies") {
                    ForEach(model.browseCompanies) { c in
                        NavigationLink(c.name, value: c)
                    }
                }
            }
        } else {
            switch model.phase {
            case .failed(let message):
                ContentUnavailableView {
                    Label("Couldn't load results", systemImage: "wifi.exclamationmark")
                } description: {
                    Text(message)
                } actions: {
                    Button("Try again") { Task { await model.search(using: api) } }
                }
                .listRowSeparator(.hidden)
            case .loaded where model.groups.isEmpty:
                ContentUnavailableView.search(text: model.query)
                    .listRowSeparator(.hidden)
            case .idle, .loading where model.groups.isEmpty:
                HStack { Spacer(); ProgressView(); Spacer() }
                    .listRowSeparator(.hidden)
            default:
                Section {
                    let scale = RangeBar.scale(for: model.groups)
                    ForEach(model.groups) { g in
                        NavigationLink(value: g) {
                            GroupRow(group: g, scale: scale)
                        }
                    }
                } header: {
                    Text(model.total > model.groups.count ? "\(model.total) results · top \(model.groups.count)" : "\(model.total) results")
                }
            }
        }
    }
}

#Preview {
    SearchView().environment(APIClient(baseURL: URL(string: "http://localhost:3000")!))
}
