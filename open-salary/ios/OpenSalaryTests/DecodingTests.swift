import XCTest
@testable import OpenSalary

/// Fixtures are real responses saved from the web app's API, so these tests catch contract drift.
final class DecodingTests: XCTestCase {
    private func fixture(_ name: String) throws -> Data {
        let url = try XCTUnwrap(Bundle(for: Self.self).url(forResource: name, withExtension: "json"))
        return try Data(contentsOf: url)
    }

    func testDecodesSearchResponse() throws {
        let r = try JSONDecoder().decode(SearchResponse.self, from: fixture("search"))
        XCTAssertTrue(r.isSample)
        XCTAssertFalse(r.groups.isEmpty)
        let g = try XCTUnwrap(r.groups.first)
        XCTAssertLessThanOrEqual(g.low, g.median)
        XCTAssertLessThanOrEqual(g.median, g.high)
        let records = try XCTUnwrap(g.records)
        XCTAssertEqual(records.count, g.count)
        XCTAssertTrue(records.allSatisfy { !$0.sourceUrl.absoluteString.isEmpty })
    }

    func testDecodesMeta() throws {
        let m = try JSONDecoder().decode(Meta.self, from: fixture("meta"))
        XCTAssertGreaterThan(m.counts.records, 0)
        XCTAssertFalse(m.sources.isEmpty)
    }

    func testRoleDisplayName() {
        XCTAssertEqual(Role(id: "a", title: "Data Scientist", level: "Level II", function: nil).displayName, "Data Scientist II")
        XCTAssertEqual(Role(id: "b", title: "Software Engineer", level: "Senior", function: nil).displayName, "Senior Software Engineer")
        XCTAssertEqual(Role(id: "c", title: "Accountant", level: nil, function: nil).displayName, "Accountant")
    }

    func testScalePadsAndContainsAllGroups() throws {
        let r = try JSONDecoder().decode(SearchResponse.self, from: fixture("search"))
        let scale = RangeBar.scale(for: r.groups)
        for g in r.groups {
            XCTAssertTrue(scale.contains(g.low) && scale.contains(g.high))
        }
    }
}
