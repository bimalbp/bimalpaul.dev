import Foundation

// Mirrors the JSON returned by the web app's /api routes (see web/lib/api.ts).

enum SourceType: String, Codable, Hashable {
    case lca, posting, user, sample

    var label: String {
        switch self {
        case .lca: "H-1B / LCA filing"
        case .posting: "Job posting"
        case .user: "User submission"
        case .sample: "Sample data"
        }
    }
}

enum PayPeriod: String, Codable, Hashable {
    case year, month, biweek, week, hour

    var suffix: String {
        switch self {
        case .year: "/yr"
        case .month: "/mo"
        case .biweek: "/2wk"
        case .week: "/wk"
        case .hour: "/hr"
        }
    }
}

struct CompanyRef: Codable, Hashable, Identifiable {
    let id: String
    let slug: String
    let name: String
}

struct Company: Codable, Hashable, Identifiable {
    let id: String
    let slug: String
    let name: String
    let aliases: [String]
    let domain: String?
}

struct Role: Codable, Hashable, Identifiable {
    let id: String
    let title: String
    let level: String?
    let function: String?

    /// "Senior Software Engineer", "Data Scientist II".
    var displayName: String {
        guard let level else { return title }
        if level.hasPrefix("Level ") { return "\(title) \(level.dropFirst("Level ".count))" }
        return "\(level) \(title)"
    }
}

struct SalaryRecord: Codable, Hashable, Identifiable {
    let id: String
    let rawTitle: String
    let min: Double
    let max: Double
    let payPeriod: PayPeriod
    let annualMin: Double
    let annualMax: Double
    let sourceType: SourceType
    let sourceUrl: URL
    let sourceRef: String?
    let observedDate: String
}

struct SalaryGroup: Codable, Hashable, Identifiable {
    let key: String
    let company: CompanyRef
    let role: Role
    let location: String
    let count: Int
    let currency: String
    let median: Double
    let p25: Double
    let p75: Double
    let low: Double
    let high: Double
    let lastUpdated: String
    let sourceTypes: [SourceType]
    let records: [SalaryRecord]?

    var id: String { key }
    /// Quartiles mean little with one or two records.
    var showsMiddleHalf: Bool { count >= 3 }
}

struct SearchResponse: Codable {
    struct Query: Codable { let q: String; let city: String }
    let query: Query
    let total: Int
    let isSample: Bool
    let groups: [SalaryGroup]
}

struct CompanyResponse: Codable {
    let company: Company
    let isSample: Bool
    let groups: [SalaryGroup]
}

struct CompanySuggestions: Codable {
    let companies: [CompanyRef]
}

struct Meta: Codable {
    struct Source: Codable, Hashable {
        let type: SourceType
        let label: String
        let url: URL
        let period: String?
    }
    struct Counts: Codable { let companies: Int; let roles: Int; let records: Int }
    let generatedAt: String
    let isSample: Bool
    let sources: [Source]
    let counts: Counts
}
