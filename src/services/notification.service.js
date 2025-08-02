const cron = require("node-cron");
const moment = require("moment");
const { PrismaClient } = require("@prisma/client");
const { sendEmail } = require("./email.service");
const ChecklistService = require("./checklist.service");

const prisma = new PrismaClient();

// ========== TEMPLATES DE EMAIL ==========

const getAssignmentEmailHtml = (task, event, responsibleUser) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #4CAF50;">Nova Tarefa Atribuída!</h2>
    <p>Olá <strong>${responsibleUser.name || "Responsável"}</strong>,</p>
    <p>Você foi atribuído a uma nova tarefa no evento <strong>${event.title}</strong>:</p>
    <p style="background-color: #f0f0f0; padding: 15px; border-left: 5px solid #4CAF50;">
      <strong>Tarefa:</strong> ${task.text}  

      <strong>Evento:s</strong> ${event.title}  

      <strong>Prazo:</strong> ${task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY HH:mm") : "Não definido"}
    </p>
    <p>Por favor, verifique os detalhes e comece a trabalhar nela.</p>
    <p>Atenciosamente,  
Sua equipe de EventFlow</p>
  </div>
`;

const getDeadlineReminderEmailHtml = (task, event, responsibleUser) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #FFC107;">⚠️ Lembrete de Prazo Próximo!</h2>
    <p>Olá <strong>${responsibleUser.name || "Responsável"}</strong>,</p>
    <p>Esta é uma lembrete de que a seguinte tarefa do evento <strong>${event.title}</strong> está com o prazo se aproximando:</p>
    <p style="background-color: #fff3e0; padding: 15px; border-left: 5px solid #FFC107;">
      <strong>Tarefa:</strong> ${task.text}  

      <strong>Evento:</strong> ${event.title}  

      <strong>Prazo:</strong> ${task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY HH:mm") : "Não definido"}
    </p>
    <p>Por favor, certifique-se de concluí-la a tempo.</p>
    <p>Atenciosamente,  
Sua equipe de EventFlow</p>
  </div>
`;

const getCompletionEmailHtml = (task, event, responsibleUser) => `
  <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #2196F3;">✅ Tarefa Concluída!</h2>
    <p>Olá <strong>${responsibleUser.name || "Responsável"}</strong>,</p>
    <p>Confirmamos que a seguinte tarefa do evento <strong>${event.title}</strong> foi marcada como concluída:</p>
    <p style="background-color: #e3f2fd; padding: 15px; border-left: 5px solid #2196F3;">
      <strong>Tarefa:</strong> ${task.text}  

      <strong>Evento:</strong> ${event.title}
    </p>
    <p>Ótimo trabalho!</p>
    <p>Atenciosamente,  
Sua equipe de EventFlow</p>
  </div>
`;

// ========== FUNÇÕES DE NOTIFICAÇÃO ==========

const sendTaskAssignmentNotification = async (checklistItemId) => {
  try {
    const task = await ChecklistService.getChecklistItemById(checklistItemId);
    if (!task || !task.responsibleUser || !task.responsibleUser.email) {
      console.log("⚠️ Não foi possível enviar notificação de atribuição: tarefa ou responsável não encontrado/email ausente.");
      return;
    }

    const event = task.event;
    const responsibleUser = task.responsibleUser;

    const subject = `Nova tarefa atribuída: ${event.title}`;
    const htmlContent = getAssignmentEmailHtml(task, event, responsibleUser);
    const textContent = `Olá ${responsibleUser.name},\nVocê foi atribuído a uma nova tarefa no evento ${event.title}:\nTarefa: ${task.text}\nEvento: ${event.title}\nPrazo: ${task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY HH:mm") : "Não definido"}\nPor favor, verifique os detalhes e comece a trabalhar nela.\nAtenciosamente,\nSua equipe de EventFlow`;

    await sendEmail(responsibleUser.email, subject, htmlContent, textContent);
    console.log(`Notificação de atribuição enviada para ${responsibleUser.email} para a tarefa ${task.text}`);
  } catch (error) {
    console.error("Erro ao enviar notificação de atribuição:", error);
  }
};

const sendTaskCompletionNotification = async (checklistItemId) => {
  try {
    const task = await ChecklistService.getChecklistItemById(checklistItemId);
    if (!task || !task.responsibleUser || !task.responsibleUser.email) {
      console.log("⚠️ Não foi possível enviar notificação de conclusão: tarefa ou responsável não encontrado/email ausente.");
      return;
    }

    const event = task.event;
    const responsibleUser = task.responsibleUser;

    const subject = `✅ Tarefa concluída: ${event.title}`;
    const htmlContent = getCompletionEmailHtml(task, event, responsibleUser);
    const textContent = `Olá ${responsibleUser.name},\nConfirmamos que a seguinte tarefa do evento ${event.title} foi marcada como concluída:\nTarefa: ${task.text}\nEvento: ${event.title}\nÓtimo trabalho!\nAtenciosamente,\nSua equipe de EventFlow`;

    await sendEmail(responsibleUser.email, subject, htmlContent, textContent);
    console.log(`Notificação de conclusão enviada para ${responsibleUser.email} para a tarefa ${task.text}`);
  } catch (error) {
    console.error("Erro ao enviar notificação de conclusão:", error);
  }
};

const checkAndSendDeadlineReminders = async () => {
  console.log("🔄 Verificando prazos de tarefas...");
  const now = moment();
  const twentyFourHoursFromNow = moment().add(24, "hours");

  try {
    const upcomingTasks = await prisma.checklistItem.findMany({
      where: {
        completed: false,
        dueDate: {
          gte: now.toDate(),
          lte: twentyFourHoursFromNow.toDate(),
        },
        responsibleId: { not: null }, // Apenas tarefas com responsável atribuído
      },
      include: {
        event: true,
        responsibleUser: true,
      },
    });

    for (const task of upcomingTasks) {
      if (task.responsibleUser && task.responsibleUser.email) {
        const subject = `⚠️ Prazo próximo: ${task.event.title}`;
        const htmlContent = getDeadlineReminderEmailHtml(task, task.event, task.responsibleUser);
        const textContent = `Olá ${task.responsibleUser.name},\nEsta é uma lembrete de que a seguinte tarefa do evento ${task.event.title} está com o prazo se aproximando:\nTarefa: ${task.text}\nEvento: ${task.event.title}\nPrazo: ${task.dueDate ? moment(task.dueDate).format("DD/MM/YYYY HH:mm") : "Não definido"}\nPor favor, certifique-se de concluí-la a tempo.\nAtenciosamente,\nSua equipe de EventFlow`;

        await sendEmail(task.responsibleUser.email, subject, htmlContent, textContent);
        console.log(`Lembrete de prazo enviado para ${task.responsibleUser.email} para a tarefa ${task.text}`);
      }
    }
    console.log(`✅ Verificação de prazos concluída. ${upcomingTasks.length} lembretes enviados.`);
  } catch (error) {
    console.error("❌ Erro ao verificar e enviar lembretes de prazo:", error);
  }
};

// ========== AGENDAMENTO DE TAREFAS ==========

// Agenda a verificação de prazos para rodar todos os dias às 9:00 AM
cron.schedule("0 9 * * *", () => {
  console.log("Executando tarefa agendada: Verificação de prazos...");
  checkAndSendDeadlineReminders();
}, {
  scheduled: true,
  timezone: "America/Sao_Paulo" // Ou o fuso horário desejado
});

// ========== TESTE DO SISTEMA DE NOTIFICAÇÕES ==========

const testNotificationSystem = async () => {
  const emailConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    from: process.env.EMAIL_FROM,
  };

  const isEmailConfigured = Object.values(emailConfig).every(val => val !== undefined && val !== null && val !== "");

  if (!isEmailConfigured) {
    console.warn("⚠️ Variáveis de ambiente de email não configuradas. O sistema de email não funcionará.");
    return { emailService: { success: false, message: "Variáveis de ambiente de email ausentes." } };
  }

  try {
    // Tenta enviar um email de teste para verificar a configuração
    const testEmailResult = await sendEmail(
      process.env.EMAIL_FROM, // Envia para o próprio remetente para teste
      "Teste de Configuração de Email - EventFlow",
      "<p>Este é um email de teste enviado pelo sistema EventFlow.</p>",
      "Este é um email de teste enviado pelo sistema EventFlow."
    );

    if (testEmailResult.success) {
      console.log("✅ Teste de envio de email bem-sucedido.");
      return { emailService: { success: true, message: "Configuração de email válida." } };
    } else {
      console.error("❌ Teste de envio de email falhou:", testEmailResult.error);
      return { emailService: { success: false, message: `Falha no envio de email: ${testEmailResult.error}` } };
    }
  } catch (error) {
    console.error("❌ Erro inesperado durante o teste do sistema de notificação:", error);
    return { emailService: { success: false, message: `Erro inesperado: ${error.message}` } };
  }
};

module.exports = {
  sendTaskAssignmentNotification,
  sendTaskCompletionNotification,
  checkAndSendDeadlineReminders,
  testNotificationSystem,
};
