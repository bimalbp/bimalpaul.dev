import SwiftUI

struct GroupRow: View {
    let group: SalaryGroup
    let scale: ClosedRange<Double>
    var showsCompany = true
    var showsRole = true

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                VStack(alignment: .leading, spacing: 2) {
                    if showsCompany {
                        Text(group.company.name)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(.tint)
                    }
                    Text(showsRole ? group.role.displayName : group.location)
                        .font(.headline)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer(minLength: 12)
                VStack(alignment: .trailing, spacing: 0) {
                    Text(Format.moneyShort(group.median, currency: group.currency))
                        .font(.title3.bold())
                        .monospacedDigit()
                    Text("median / yr")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            RangeBar(group: group, scale: scale)
            Text("\(Format.moneyShort(group.low, currency: group.currency))–\(Format.moneyShort(group.high, currency: group.currency)) range")
                .font(.caption)
                .foregroundStyle(.secondary)
                .monospacedDigit()
        }
        .padding(.vertical, 4)
    }

    private var subtitle: String {
        let records = group.count == 1 ? "1 record" : "\(group.count) records"
        return showsRole ? "\(group.location) · \(records)" : "\(records) · updated \(group.lastUpdated)"
    }
}
