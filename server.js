require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const allowedOrigins = [
  "http://localhost:3000",
  "https://flaviocosta-eng.vercel.app",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.post("/resumes", async (req, res) => {
  const { foto, nome, endereco_linkedin, telefone, email, resumo } = req.body;
  
  const { data, error } = await supabase.from("resumes").insert([{ foto, nome, endereco_linkedin, telefone, email, resumo }]);

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json(data);
});

app.get("/resumes", async (req, res) => {
  const { data, error } = await supabase
  .from('resumes')
  .select('*');
  console.log('resumes', data)

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

app.get("/resumes/:id", async (req, res) => {
  const { id } = req.params;

  const { data: curriculo, error: err1 } = await supabase.from("resumes").select("*").eq("id", id).single();
  if (err1) return res.status(404).json({ error: "Currículo não encontrado" });

  const { data: experiencias } = await supabase.from("experiences").select("*").eq("resume_id", id);
  const { data: certificados } = await supabase.from("certifications").select("*").eq("resume_id", id);
  const { data: formacao } = await supabase.from("education").select("*").eq("resume_id", id);
  const { data: linguas } = await supabase.from("languages").select("*").eq("resume_id", id);

  res.json({ ...curriculo, experiencias, certificados, formacao, linguas });
});

app.put("/resumes/:id", async (req, res) => {
  const { id } = req.params;
  const { foto, nome, endereco_linkedin, telefone, email, resumo } = req.body;

  const { data, error } = await supabase.from("resumes").update({ foto, nome, endereco_linkedin, telefone, email, resumo }).eq("id", id);

  if (error) return res.status(400).json({ error: error.message });

  res.json(data);
});

app.delete("/resumes/:id", async (req, res) => {
  const { id } = req.params;
  
  await supabase.from("experiencias").delete().eq("curriculo_id", id);
  await supabase.from("certificados").delete().eq("curriculo_id", id);
  await supabase.from("formacao_academica").delete().eq("curriculo_id", id);
  await supabase.from("linguas").delete().eq("curriculo_id", id);
  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ message: "Currículo deletado com sucesso" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
