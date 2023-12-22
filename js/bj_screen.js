const SDK = window.AFREECA.ext;
const extensionSdk = SDK();

const START_ = "start_game";

const rpslogo = document.querySelector("#rpslogo");
const backbtn = document.querySelector("#backbtn");

const handleBroadcastReceived = (action, message, fromId) => {
  // 게임 시작 액션
  if (action === START_GAME) {
    if (message == "main") {
      window.location = "./user_screen.html";
    } else if (message == "rps") {
      window.location = "./user_rps_screen.html";
    } else if (message == "user5wh1") {
      window.location = "./user_user5wh1_screen.html";
    }
  }
};

extensionSdk.broadcast.listen(handleBroadcastReceived);

const setDefaultDisplay = (action) => {
  const defaultClasses = document.querySelectorAll(".default");

  defaultClasses.forEach(function (el) {
    el.style.display = action === "show" ? "" : "none";
  });
};
