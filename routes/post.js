const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

const supabase = require("../config/supabase");
const auth = require("../middleware/auth");

router.get("/posts", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    // Format agar sesuai dengan PostListModel di Flutter
    res.json({
      status: 200,
      data: data.map((item) => ({
        ...item,
        status_code: 200, // PostModel di Flutter mencari status_code
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/posts", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = req.body.image || null;

    if (!title) {
      return res.status(400).json({ message: "Judul (title) wajib diisi" });
    }

    // Upload ke Supabase Storage jika ada file
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        return res
          .status(500)
          .json({ message: "Gagal upload gambar: " + uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          title,
          content,
          category: category || "Travel",
          image: imageUrl,
          slug,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      status_code: 200,
      data: {
        ...data[0],
        status_code: 200,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/posts/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    let imageUrl = req.body.image; // Keep existing image if no new file

    if (!title) {
      return res.status(400).json({ message: "Judul (title) wajib diisi" });
    }

    // Upload ke Supabase Storage jika ada file baru
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
        });

      if (uploadError) {
        return res
          .status(500)
          .json({ message: "Gagal upload gambar: " + uploadError.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from("post-images")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const slug = title.toLowerCase().replace(/ /g, "-") + "-" + Date.now();

    const { data, error } = await supabase
      .from("posts")
      .update({
        title,
        content,
        category,
        image: imageUrl,
        slug,
      })
      .eq("id", req.params.id)
      .select();

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json({
      status_code: 200,
      data: {
        ...data[0],
        status_code: 200,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/posts/:id", auth, async (req, res) => {
  try {
    // 1. Ambil data post untuk mendapatkan URL gambar
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("image")
      .eq("id", req.params.id)
      .single();

    if (fetchError) {
      return res.status(500).json({ message: "Gagal mencari data post" });
    }

    // 2. Hapus gambar dari Storage jika ada
    if (post && post.image) {
      try {
        // Ekstrak nama file dari URL publik Supabase
        // Format URL biasanya: https://.../storage/v1/object/public/post-images/nama-file.jpg
        const imageUrlParts = post.image.split("/");
        const fileName = imageUrlParts[imageUrlParts.length - 1];

        const { error: storageError } = await supabase.storage
          .from("post-images")
          .remove([fileName]);

        if (storageError) {
          console.error(
            "Gagal menghapus file di storage:",
            storageError.message,
          );
          // Kita lanjutkan proses hapus record database meskipun storage gagal
        }
      } catch (err) {
        console.error("Error saat parsing URL gambar:", err.message);
      }
    }

    // 3. Hapus data post dari Database
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", req.params.id);

    if (deleteError) {
      return res.status(500).json({ message: deleteError.message });
    }

    res.json({
      status_code: 200,
      success: true,
      message: "Postingan dan gambar berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
