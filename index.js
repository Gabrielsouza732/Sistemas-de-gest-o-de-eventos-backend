const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Importar rotas
const eventRoutes = require("./src/routes/event.routes");
const checklistRoutes = require("./src/routes/checklist.routes");
const commentRoutes = require("./src/routes/comment.routes");
const notificationRoutes = require("./src/routes/notification.routes");
const userRoutes = require("./src/routes/user.routes");

// Importar serviços para inicialização
const ChecklistService = require("./src/services/checklist.service");
const NotificationService = require("./src/services/notification.service");
const UserService = require("./src/services/user.service");

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas da API
app.use("/api/events", eventRoutes);
app.use("/api/checklist", checklistRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API funcionando com sucesso!");
});

// Função de inicialização
const initializeApp = async () => {
  try {
    console.log("🚀 Inicializando aplicação...");

    // Criar usuários padrão
    await UserService.createDefaultUsers();

    // Criar templates padrão de checklist
    await ChecklistService.createDefaultTemplates();
    console.log("✅ Templates de checklist inicializados");

    // Inicializar serviço de notificações
    console.log("📧 Serviço de notificações inicializado");

    // Testar configuração de email
    const emailTest = await NotificationService.testNotificationSystem();
    if (emailTest.emailService.success) {
      console.log("✅ Configuração de email válida");
    } else {
      console.log("⚠️ Email não configurado - notificações serão apenas logadas");
    }

    console.log("🎉 Aplicação inicializada com sucesso!");
  } catch (error) {
    console.error("❌ Erro na inicialização:", error);
  }
};

// Inicializar servidor
app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  await initializeApp();
});
