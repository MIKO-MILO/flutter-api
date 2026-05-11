const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const auth = require("../middleware/auth");

router.get("/posts", auth, async (req, res) => {
  const { data, error } = await supabase.from("posts").select("*");

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data);
});

router.post("/posts", auth, async (req, res) => {
  const { title, content, category, image } = req.body;

  const { data, error } = await supabase
    .from("posts")
    .insert([
      {
        title,
        content,
        category,
        image,
        slug: title.toLowerCase().replace(/ /g, "-"),
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data[0]);
});

router.post("/posts/:id", auth, async (req, res) => {
  const { title, content, category, image } = req.body;

  const { data, error } = await supabase
    .from("posts")
    .update({
      title,
      content,
      category,
      image,
      slug: title.toLowerCase().replace(/ /g, "-"),
    })
    .eq("id", req.params.id)
    .select();

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json(data[0]);
});

router.delete("/posts/:id", auth, async (req, res) => {
  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    return res.status(500).json({ message: error.message });
  }

  res.json({
    success: true,
  });
});

module.exports = router;
