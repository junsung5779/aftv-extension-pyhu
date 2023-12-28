const SDK = window.AFREECA.ext;
const extensionSdk = SDK();

var currentState = "종료"; // 현재 상태
var autoEndTimeout; // 자동 종료 타이머를 위한 변수

// 로컬 스토리지에서 사용자 리스트 불러오기
const loadUserListFromLocalStorage = () => {
  const storedList = localStorage.getItem("pyhuUserList");
  return storedList ? JSON.parse(storedList) : [];
};

// 로컬 스토리지에 사용자 리스트 저장하기
const saveUserListToLocalStorage = (userList) => {
  localStorage.setItem("pyhuUserList", JSON.stringify(userList));
};

const handleChatInfoReceived = (action, message) => {
  // '종료' 상태인 경우, 채팅 메시지를 처리하지 않음
  if (currentState === "종료") {
    return;
  }

  switch (action) {
    // 일반 메세지를 수신
    case "MESSAGE":
      processChatMessage(message);
      break;
    default:
      break;
  }
};

// 추첨 리스트에 추가 하기 전 유효성 검사
const processChatMessage = (message) => {
  // 메시지에 '손'이 포함되어 있는지 확인
  if (message.message.includes("손")) {
    let userInfo = {
      userId: message.userId,
      userNickname: message.userNickname,
    };

    // 로컬스토리지 불러오기
    let oUserList = loadUserListFromLocalStorage();

    // oUserList에 해당 사용자 정보가 존재하지 않는 경우에만 추가
    // some(자바스크립트 내장 함수) 메서드가 true를 반환한다면, 배열에 이미 해당 userId를 가진 사용자가 존재한다는 의미
    if (!oUserList.some((user) => user.userId === message.userId)) {
      oUserList.push(userInfo);
      // 로컬스토리지에 저장
      saveUserListToLocalStorage(oUserList);
    }
  }
};

// 채팅 입력 감지
extensionSdk.chat.listen(handleChatInfoReceived);

// DOMContentLoaded: DOM 완전히 load 된 이후에 접근
document.addEventListener("DOMContentLoaded", function () {
  var statusElement = document.getElementById("status"); // 현재 상태 표시
  var startBtn = document.getElementById("start_btn"); // 시작버튼
  var endBtn = document.getElementById("end_btn"); // 종료버튼
  // 추첨하기 버튼에 대한 이벤트 리스너
  var drawBtn = document.getElementById("draw_btn");
  var winner = document.getElementById("winner");

  // 시작 버튼에 대한 이벤트 리스너
  startBtn.addEventListener("click", function () {
    extensionSdk.chat.send("MESSAGE", "-----시작-----");
    if (currentState !== "진행중") {
      updateState("진행중");
      localStorage.removeItem("pyhuUserList");
      autoEndTimeout = setTimeout(() => updateState("종료"), 300000);
    } else {
      alert("이미 진행중입니다");
    }
    winner.textContent = "당첨자: ";

    let timeLeft = 300; // 5분 = 300초
    countdownTimer = setInterval(function () {
      document.getElementById("countdown").textContent = `남은 시간: ${timeLeft}초`;
      timeLeft--;

      if (timeLeft <= 0) {
        clearInterval(countdownTimer);
        // 종료 로직
        updateState("종료");
      }
    }, 1000); // 매 초마다 업데이트
  });

  endBtn.addEventListener("click", function () {
    updateState("종료");
    extensionSdk.chat.send("MESSAGE", "-----종료-----");

    // 로컬 스토리지에서 사용자 목록 불러오기
    const storedList = localStorage.getItem("pyhuUserList");
    const userList = storedList ? JSON.parse(storedList) : [];

    statusElement.textContent = "현재상태: " + currentState;

    // 자동 종료 타이머 취소
    clearTimeout(autoEndTimeout);
    winner.textContent = "당첨자: ";

    // 카운트다운 타이머 중단 및 남은 시간 0초 설정
    clearInterval(countdownTimer);
    document.getElementById("countdown").textContent = "남은 시간: 0초";
  });

  drawBtn.addEventListener("click", function () {
    // 로컬 스토리지에 저장된 유저 리스트 불러오기
    const oUserList = loadUserListFromLocalStorage();

    if (oUserList.length > 0) {
      // 자바스크립트 표준 내장 객체 Math 사용하여 랜덤 로직 구현
      var randomIndex = Math.floor(Math.random() * oUserList.length);
      var selectedUser = oUserList[randomIndex];
      winner.textContent = "당첨자: " + selectedUser.userId + "(" + selectedUser.userNickname + ")";
    } else {
      // 추첨 리스트에 아무도 없는 경우
      winner.textContent = "당첨자: 없음";
    }
  });

  function updateState(newState) {
    currentState = newState;
    statusElement.textContent = "현재상태: " + currentState;

    if (currentState === "진행중") {
      startBtn.disabled = true; // 시작 버튼 비활성화
      endBtn.disabled = false; // 종료 버튼 활성화
      drawBtn.disabled = true; // 추첨하기 버튼 비활성화
    } else if (currentState === "종료") {
      startBtn.disabled = false; // 시작 버튼 활성화
      endBtn.disabled = true; // 종료 버튼 비활성화
      drawBtn.disabled = false; // 추첨하기 버튼 활성화
    }

    // 종료 상태인 경우 자동 종료 타이머 취소
    if (currentState === "종료") {
      clearTimeout(autoEndTimeout);
    }
  }
});
