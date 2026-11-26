import SwiftUI

@main
struct OpenSalaryApp: App {
    @State private var api = APIClient.fromBundle()

    var body: some Scene {
        WindowGroup {
            SearchView()
                .environment(api)
        }
    }
}
