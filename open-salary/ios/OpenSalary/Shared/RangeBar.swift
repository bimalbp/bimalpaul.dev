import SwiftUI

/// Low–high range as a thin line, the middle half (25th–75th percentile) as a band,
/// and the median as a tick. `scale` is shared across a list so bars compare.
struct RangeBar: View {
    let group: SalaryGroup
    let scale: ClosedRange<Double>

    var body: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let x = { (v: Double) -> CGFloat in
                CGFloat((v - scale.lowerBound) / max(1, scale.upperBound - scale.lowerBound)) * w
            }
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(Color.secondary.opacity(0.45))
                    .frame(width: max(2, x(group.high) - x(group.low)), height: 2)
                    .offset(x: x(group.low))
                if group.showsMiddleHalf {
                    Capsule()
                        .fill(Color.accentColor.opacity(0.8))
                        .frame(width: max(6, x(group.p75) - x(group.p25)), height: 12)
                        .offset(x: x(group.p25))
                }
                RoundedRectangle(cornerRadius: 1.5)
                    .fill(Color.primary)
                    .frame(width: 3, height: 18)
                    .offset(x: x(group.median) - 1.5)
            }
            .frame(maxHeight: .infinity)
        }
        .frame(height: 18)
        .accessibilityElement()
        .accessibilityLabel(accessibilityText)
    }

    private var accessibilityText: String {
        let c = group.currency
        var s = "Range \(Format.moneyShort(group.low, currency: c)) to \(Format.moneyShort(group.high, currency: c))"
        if group.showsMiddleHalf {
            s += ", middle half \(Format.moneyShort(group.p25, currency: c)) to \(Format.moneyShort(group.p75, currency: c))"
        }
        return s + ", median \(Format.moneyShort(group.median, currency: c))"
    }

    static func scale(for groups: [SalaryGroup]) -> ClosedRange<Double> {
        guard let lo = groups.map(\.low).min(), let hi = groups.map(\.high).max() else { return 0...1 }
        let pad = (hi - lo) * 0.04
        return Swift.max(0, lo - pad)...(hi + Swift.max(pad, 1))
    }
}
