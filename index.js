const axios = require('axios');
const core = require('@actions/core');

async function sendNotification() {
    try {

        console.log(process.env);
        const token = core.getInput('token', { required: true });
        const chatId = core.getInput('chatId', { required: true });
        const status = core.getInput('status', { required: true });
        const githubDataBase64 = core.getInput('githubDataBase64', { required: true });
        const errorMessage = core.getInput('errorMessage', { required: false });

        const githubDataJson = Buffer.from(githubDataBase64, 'base64').toString();
        const githubData = JSON.parse(githubDataJson);

        const headerMessagePart = status === 'success' ?
            `✅ <b>Deployment successful on branch:</b> <i>${githubData.ref_name}</i>` :
            `❌ <b>Deployment failed on branch:</b> <i>${githubData.ref_name}</i>. Error: ${errorMessage}`;

        const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

        const commitsMessagePart = githubData.event.commits.map((commit, index) => `  ${numbers[index]} <u><a href="${commit.url}">${commit.message}</a></u>`).join('\n');
        const repositoryMessagePart = `🖇 <b>Repository:</b> <i><a href="${githubData.event.repository.html_url}">${githubData.event.repository.name}</a></i>`;
        const byMessagePart = `<b>By:</b> <i><a href="${githubData.event.sender.html_url}">${githubData.actor}</a></i>`;

        const message = `${headerMessagePart}\n${repositoryMessagePart}\n\n${commitsMessagePart}\n\n${byMessagePart}`;

        await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
        });

    } catch (error) {
        core.setFailed(`Error sending message: ${error}`);
    }
}

sendNotification(token, chatId, status, githubDataBase64, errorMessage);
