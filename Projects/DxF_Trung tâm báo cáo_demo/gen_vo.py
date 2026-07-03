import json, subprocess, os, sys, time
try: sys.stdout.reconfigure(encoding="utf-8")
except Exception: pass

VOICE = "vi-VN-HoaiMyNeural"
RATE = "+6%"
OUT = "assets/voice"
os.makedirs(OUT, exist_ok=True)

SEGMENTS = [
    ("vo01_hook",   "Mỗi ngày, nhà máy của anh chị sinh ra hàng nghìn con số. Nhưng ai đủ thời gian để đọc, và để hiểu?"),
    ("vo02_brand",  "Đi-ếch phách-to-ri — nền tảng ây ai cho nhà máy sản xuất thông minh."),
    ("vo03_open",   "Chỉ vài giây, mở Trung tâm Báo cáo. Toàn bộ dữ liệu vận hành, gom về một nơi."),
    ("vo04_report", "Báo cáo hoạt động máy ngày mười bốn tháng Sáu: máy đang sửa chữa, thời gian sự cố, công việc bảo trì, rõ ràng tức thì."),
    ("vo05_ask",    "Không cần lập trình, cũng chẳng cần truy vấn. Chỉ cần hỏi Trợ lý ây ai, bằng tiếng Việt."),
    ("vo06_process","Ngay lập tức, ây ai đọc dữ liệu ba nhà máy, và phân tích chuyên sâu."),
    ("vo07_ins1",   "Tám mươi ba sự cố ngoài kế hoạch. Máy K mười hai dừng lâu nhất, hơn bảy trăm giờ."),
    ("vo08_ins2",   "Ây ai chỉ ra đúng ba máy cần ưu tiên bảo trì, và những máy cần rà soát nguyên nhân gốc rễ."),
    ("vo09_value",  "Việc trước đây tốn hàng giờ phân tích, giờ chỉ còn vài giây."),
    ("vo10_close",  "Đi-ếch phách-to-ri. Biến dữ liệu nhà máy, thành quyết định. Ngay hôm nay."),
]

def synth(name, text, tries=8):
    path = f"{OUT}/{name}.mp3"
    if os.path.exists(path) and os.path.getsize(path) > 1000:
        return path  # reuse already-good file
    err = ""
    for i in range(tries):
        try:
            if os.path.exists(path): os.remove(path)
        except Exception: pass
        r = subprocess.run(
            [sys.executable, "-m", "edge_tts", "--voice", VOICE, "--rate", RATE,
             "--text", text, "--write-media", path],
            capture_output=True, text=True)
        if os.path.exists(path) and os.path.getsize(path) > 1000:
            time.sleep(1.2)  # be gentle with the endpoint
            return path
        err = (r.stderr or "")[-120:]
        time.sleep(3 + i * 2)  # growing backoff
    raise RuntimeError(f"TTS failed for {name}: {err}")

res = []
for name, text in SEGMENTS:
    p = synth(name, text)
    dur = float(subprocess.check_output(
        ["ffprobe","-v","error","-show_entries","format=duration","-of","default=nw=1:nk=1", p]).decode().strip())
    res.append({"name": name, "text": text, "path": p, "dur": round(dur, 3)})
    print(f"{name}: {round(dur,3)}s | {text[:48]}...")

total = round(sum(r["dur"] for r in res), 2)
print("TOTAL speech:", total, "s")
json.dump({"voice": VOICE, "rate": RATE, "total": total, "segments": res},
          open(f"{OUT}/vo_meta.json","w",encoding="utf8"), ensure_ascii=False, indent=2)
