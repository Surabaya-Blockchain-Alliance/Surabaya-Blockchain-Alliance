const axios = require("axios");

async function verifyTask() {
  try {
    const response = await axios.post(
      "https://surabaya-blockchain-alliance-git-quest-cardanohubindonesia.vercel.app/api/verify-task",
      {
        type: "follow twitter",
        username: "alfcomunitynode",
        target: "cofinancedefi",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Response:", response.data);
  } catch (error) {
    if (error.response) {
      console.error("❌ Error:", error.response.data);
    } else {
      console.error("❌ Request Failed:", error.message);
    }
  }
}

verifyTask();
