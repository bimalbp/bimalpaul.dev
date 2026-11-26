import SwiftUI

struct SampleBanner: View {
    var body: some View {
        Label {
            Text("**Sample data.** These companies are fictional and the numbers are generated for the demo.")
                .font(.footnote)
        } icon: {
            Image(systemName: "info.circle.fill").foregroundStyle(.orange)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
    }
}
