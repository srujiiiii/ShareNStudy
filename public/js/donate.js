// Attach to your donate page form, id="donateForm", file input name="images" multiple
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("donateForm");
  if (!form) return;

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) { alert("Not logged in"); return; }

    const formData = new FormData(form); // ensure input names match: title, author, subject, edition, condition, price, isDonation, images

    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }, // do not set Content-Type; browser sets boundary automatically
        body: formData
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        console.error("Upload failed", res.status, data);
        alert("Upload failed: " + (data && data.message ? data.message : res.status));
        return;
      }
      console.log("Book created", data);
      alert("Book posted successfully");
      window.location.href = "/myshelf";
    } catch (err) {
      console.error("Upload error", err);
      alert("Upload error: " + String(err));
    }
  });
});