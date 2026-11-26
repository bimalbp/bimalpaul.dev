import SwiftUI

struct GroupDetailView: View {
    let group: SalaryGroup

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 12) {
                    NavigationLink(value: group.company) {
                        Text(group.company.name).font(.subheadline.weight(.semibold)).foregroundStyle(.tint)
                    }
                    Text(group.location).foregroundStyle(.secondary)
                    Text(Format.moneyShort(group.median, currency: group.currency))
                        .font(.system(size: 44, weight: .bold))
                        .monospacedDigit()
                    + Text("  median / yr").font(.subheadline).foregroundColor(.secondary)
                    RangeBar(group: group, scale: RangeBar.scale(for: [group]))
                }
                .padding(.vertical, 4)
            }

            Section("Summary") {
                LabeledContent("Range", value: "\(money(group.low)) – \(money(group.high))")
                if group.showsMiddleHalf {
                    LabeledContent("Middle half", value: "\(money(group.p25)) – \(money(group.p75))")
                }
                LabeledContent("Records", value: "\(group.count)")
                LabeledContent("Last updated", value: group.lastUpdated)
            }

            if let records = group.records {
                Section {
                    ForEach(records) { r in
                        RecordRow(record: r, currency: group.currency)
                    }
                } header: {
                    Text("Sources")
                } footer: {
                    Text("Every number links to the public record it came from. Hourly and monthly pay is converted to a yearly figure (2,080 hours a year).")
                }
            }
        }
        .navigationTitle(group.role.displayName)
        .navigationBarTitleDisplayMode(.inline)
    }

    private func money(_ v: Double) -> String { Format.money(v, currency: group.currency) }
}

private struct RecordRow: View {
    let record: SalaryRecord
    let currency: String

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(alignment: .firstTextBaseline) {
                Text(record.rawTitle).font(.subheadline)
                Spacer()
                Text(record.observedDate).font(.caption).foregroundStyle(.secondary)
            }
            Text(Format.range(record, currency: currency))
                .font(.subheadline.weight(.semibold))
                .monospacedDigit()
            HStack(spacing: 6) {
                Link(destination: record.sourceUrl) {
                    Label(record.sourceType.label, systemImage: "arrow.up.right.square")
                        .font(.caption)
                }
                if let ref = record.sourceRef {
                    Text(ref).font(.caption.monospaced()).foregroundStyle(.secondary).textSelection(.enabled)
                }
            }
        }
        .padding(.vertical, 2)
    }
}
