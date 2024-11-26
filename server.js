require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors({ origin: 'https://flaviocosta-eng.vercel.app/' })); 
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/increment", async (req, res) => {
  const { data, error } = await supabase
    .from("visitors")
    .select("count")
    .single();

  if (error) {
    await supabase.from("visitors").insert({ count: 1 });
    return res.json({ count: 1 });
  }

  const newCount = data.count + 1

  await supabase
  .from('visitors')
  .update({ count: newCount});

  res.json({ count: newCount});
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
