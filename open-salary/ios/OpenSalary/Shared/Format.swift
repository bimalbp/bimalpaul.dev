import Foundation

enum Format {
    /// 154000 -> "$154K"
    static func moneyShort(_ value: Double, currency: String = "USD") -> String {
        value.formatted(.currency(code: currency).notation(.compactName).precision(.fractionLength(0...(value >= 1_000_000 ? 1 : 0))))
    }

    /// 154000 -> "$154,000"; 52.5 -> "$52.50"
    static func money(_ value: Double, currency: String = "USD") -> String {
        let fraction = value.rounded() == value ? 0 : 2
        return value.formatted(.currency(code: currency).precision(.fractionLength(fraction)))
    }

    static func range(_ record: SalaryRecord, currency: String) -> String {
        let lo = money(record.min, currency: currency)
        let text = record.max == record.min ? lo : "\(lo)–\(money(record.max, currency: currency))"
        return text + record.payPeriod.suffix
    }
}
