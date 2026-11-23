// Finds the focal point of every photo in media-src/ with Apple's Vision framework
// (macOS only) and writes scripts/focus.json, which optimize-media.mjs folds into
// app/data/media.json. Run after adding photos:  npm run media:focus
//
// Order of preference: faces > people (aim at head height) > saliency > centre.
// The result is a CSS object-position ("x% y%"): it keeps the subject in frame for any
// crop shape, from a tall phone hero to a wide banner.
import Foundation
import ImageIO
import Vision

let root = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "media-src")
let out = URL(fileURLWithPath: CommandLine.arguments.count > 2 ? CommandLine.arguments[2] : "scripts/focus.json")

struct Box { var x, y, w, h: Double } // top-left origin, 0…1

func boxes<T: VNDetectedObjectObservation>(_ obs: [T]?) -> [Box] {
    (obs ?? []).map { o in
        let b = o.boundingBox // Vision: bottom-left origin
        return Box(x: b.minX, y: 1 - b.maxY, w: b.width, h: b.height)
    }
}

func pct(_ v: Double) -> Int { Int((min(1, max(0, v)) * 100).rounded()) }

func focus(for url: URL) -> (String, String)? {
    guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
          let img = CGImageSourceCreateImageAtIndex(src, 0, nil) else { return nil }
    let aspect = Double(img.width) / Double(img.height)
    let handler = VNImageRequestHandler(cgImage: img, options: [:])

    let faceReq = VNDetectFaceRectanglesRequest()
    let humanReq = VNDetectHumanRectanglesRequest()
    humanReq.upperBodyOnly = false
    let salReq = VNGenerateAttentionBasedSaliencyImageRequest()
    try? handler.perform([faceReq, humanReq, salReq])

    // A phone-portrait crop of this image keeps this fraction of its width.
    let phoneWidth = min(1, (9.0 / 16.0) / aspect)

    let faces = boxes(faceReq.results).filter { $0.w * $0.h > 0.0004 }
    if let largest = faces.max(by: { $0.w * $0.h < $1.w * $1.h }) {
        // Keep similar-sized faces together if they fit in a phone crop, else the largest.
        let peers = faces.filter { $0.w * $0.h >= 0.5 * largest.w * largest.h }
        let minX = peers.map { $0.x }.min()!, maxX = peers.map { $0.x + $0.w }.max()!
        let group = (maxX - minX) <= phoneWidth * 0.9 ? peers : [largest]
        let gx = (group.map { $0.x }.min()! + group.map { $0.x + $0.w }.max()!) / 2
        let gy = (group.map { $0.y }.min()! + group.map { $0.y + $0.h }.max()!) / 2
        return ("\(pct(gx))% \(pct(gy))%", "face")
    }

    let people = boxes(humanReq.results)
    if let p = people.max(by: { $0.w * $0.h < $1.w * $1.h }) {
        return ("\(pct(p.x + p.w / 2))% \(pct(p.y + p.h * 0.18))%", "person")
    }

    if let sal = (salReq.results?.first as? VNSaliencyImageObservation)?.salientObjects, !sal.isEmpty {
        let b = boxes(sal)
        let x = (b.map { $0.x }.min()! + b.map { $0.x + $0.w }.max()!) / 2
        let y = (b.map { $0.y }.min()! + b.map { $0.y + $0.h }.max()!) / 2
        return ("\(pct(x))% \(pct(y))%", "salient")
    }
    return ("50% 40%", "default")
}

var result: [String: [String: String]] = [:]
let fm = FileManager.default
for set in (try? fm.contentsOfDirectory(atPath: root.path))?.sorted() ?? [] where !set.hasPrefix(".") && set != "logos" {
    let dir = root.appendingPathComponent(set)
    for file in (try? fm.contentsOfDirectory(atPath: dir.path))?.sorted() ?? [] {
        let lower = file.lowercased()
        guard lower.hasSuffix(".jpg") || lower.hasSuffix(".jpeg") || lower.hasSuffix(".png") else { continue }
        let name = (file as NSString).deletingPathExtension
        if let (f, how) = focus(for: dir.appendingPathComponent(file)) {
            result["\(set)/\(name)"] = ["focus": f, "by": how]
        }
    }
}

let data = try JSONSerialization.data(withJSONObject: result, options: [.prettyPrinted, .sortedKeys])
try data.write(to: out)
let counts = Dictionary(grouping: result.values, by: { $0["by"]! }).mapValues { $0.count }
print("focus.json: \(result.count) photos", counts)
