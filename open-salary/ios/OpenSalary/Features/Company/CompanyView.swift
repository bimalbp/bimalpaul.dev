import SwiftUI

struct CompanyView: View {
    let company: CompanyRef
    @Environment(APIClient.self) private var api
    @State private var result: CompanyResponse?
    @State private var error: String?

    var body: some View {
        List {
            if let result {
                if result.isSample {
                    SampleBanner().listRowSeparator(.hidden)
                }
                Section {
                    Text(summary(result)).font(.subheadline).foregroundStyle(.secondary)
                }
                let scale = RangeBar.scale(for: result.groups)
                ForEach(byRole(result.groups)) { section in
                    Section(section.role.displayName) {
                        ForEach(section.groups) { g in
                            NavigationLink(value: g) {
                                GroupRow(group: g, scale: scale, showsCompany: false, showsRole: false)
                            }
                        }
                    }
                }
            } else if let error {
                ContentUnavailableView {
                    Label("Couldn't load \(company.name)", systemImage: "exclamationmark.triangle")
                } description: {
                    Text(error)
                } actions: {
                    Button("Try again") { Task { await load() } }
                }
            } else {
                HStack { Spacer(); ProgressView(); Spacer() }.listRowSeparator(.hidden)
            }
        }
        .navigationTitle(company.name)
        .task { await load() }
        .refreshable { await load() }
    }

    private func load() async {
        do {
            result = try await api.company(slug: company.slug)
            error = nil
        } catch {
            self.error = error.localizedDescription
        }
    }

    private func summary(_ r: CompanyResponse) -> String {
        let roles = Set(r.groups.map(\.role.id)).count
        let cities = Set(r.groups.map(\.location)).count
        let records = r.groups.reduce(0) { $0 + $1.count }
        return "\(roles) roles · \(cities) cities · \(records) records"
    }

    private func byRole(_ groups: [SalaryGroup]) -> [RoleSection] {
        var sections: [RoleSection] = []
        var index: [String: Int] = [:]
        for g in groups {
            if let i = index[g.role.id] {
                sections[i].groups.append(g)
            } else {
                index[g.role.id] = sections.count
                sections.append(RoleSection(role: g.role, groups: [g]))
            }
        }
        return sections
    }
}

private struct RoleSection: Identifiable {
    let role: Role
    var groups: [SalaryGroup]
    var id: String { role.id }
}
