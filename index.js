const axios = require('axios');
const core = require('@actions/core');
const { context } = require('@actions/github');

async function sendNotification() {
    try {
        const token = core.getInput('token', { required: true });
        const chatId = +core.getInput('chatId', { required: true });
        const status = core.getInput('status', { required: true });
        const errorMessage = core.getInput('errorMessage', { required: false });

        const githubData = context.payload;

        const headerMessagePart = status === 'success' ?
            `✅ <b>Deployment successful on branch:</b> <i>${githubData.ref.split('/').pop()}</i>` :
            `❌ <b>Deployment failed on branch:</b> <i>${githubData.ref.split('/').pop()}</i>. Error: ${errorMessage}`;

        const numbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
        const commitsList = githubData.commits.map((commit, index) => `  ${numbers[index]} <u><a href="${commit.url}">${commit.message}</a></u>`).join('\n');

        const commitsMessagePart = `📝 <b>Commits:</b>\n${commitsList}`;
        const repositoryMessagePart = `🖇 <b>Repository:</b> <i><a href="${githubData.repository.html_url}">${githubData.repository.name}</a></i>`;
        const byMessagePart = `<b>By:</b> <i><a href="${githubData.sender.html_url}">${githubData.sender.login}</a></i>`;

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

sendNotification();
