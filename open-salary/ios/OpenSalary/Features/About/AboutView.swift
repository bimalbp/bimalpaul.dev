import SwiftUI

struct AboutView: View {
    @Environment(APIClient.self) private var api
    @Environment(\.dismiss) private var dismiss
    @State private var meta: Meta?

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Open Salary Data is free and public. Anyone can see salary ranges with no account, no sign-in and no paywall. Companies may later pay to publish verified data, but no one ever pays to view it.")
                }
                Section("Where numbers come from") {
                    Text("**H-1B / LCA wage disclosures** from the US Department of Labor's quarterly public datasets. These are usually base pay only.")
                    Text("**Job postings in pay-transparency states** (New York, California, Colorado, Washington). Coming next.")
                }
                Section("How to read a result") {
                    Text("Each result is one role at one company in one city. The bar's thin line spans the lowest to highest figures, the band is the middle half (25th–75th percentile), and the tick is the median.")
                }
                if let meta {
                    Section("Current dataset") {
                        LabeledContent("Records", value: meta.counts.records.formatted())
                        LabeledContent("Companies", value: meta.counts.companies.formatted())
                        LabeledContent("Generated", value: String(meta.generatedAt.prefix(10)))
                        ForEach(meta.sources, id: \.self) { s in
                            Link(destination: s.url) {
                                Text(s.period.map { "\(s.label) · \($0)" } ?? s.label)
                            }
                        }
                    }
                }
                Section {
                    LabeledContent("Server", value: api.baseURL.absoluteString)
                        .font(.footnote)
                }
            }
            .navigationTitle("About the data")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) { Button("Done") { dismiss() } }
            }
            .task { meta = try? await api.meta() }
        }
    }
}
