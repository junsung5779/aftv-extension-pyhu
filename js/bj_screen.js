const SDK = window.AFREECA.ext;
const extensionSdk = SDK();

var currentState = "종료"; // 현재 상태
var autoEndTimeout; // 자동 종료 타이머를 위한 변수

// 로컬 스토리지에서 사용자 리스트 불러오기
const loadUserListFromLocalStorage = () => {
  const storedList = localStorage.getItem("userList");
  return storedList ? JSON.parse(storedList) : [];
};

// 로컬 스토리지에 사용자 리스트 저장하기
const saveUserListToLocalStorage = (userList) => {
  localStorage.setItem("userList", JSON.stringify(userList));
};

const handleChatInfoReceived = (action, message) => {
  // '종료' 상태인 경우, 채팅 메시지를 처리하지 않음
  if (currentState === "종료") {
    return;
  }

  switch (action) {
    // 일반 메세지를 수신
    case "MESSAGE":
      // '손!' 메시지를 보낸 사용자의 정보를 확인
      if (message.message === "손!") {
        let userInfo = {
          userId: message.userId,
          userNickname: message.userNickname,
        };

        let oUserList = loadUserListFromLocalStorage();

        // oUserList에 해당 사용자 정보가 존재하지 않는 경우에만 추가
        // some(자바스크립트 내장 함수) 메서드가 true를 반환한다면, 배열에 이미 해당 userId를 가진 사용자가 존재한다는 의미
        if (!oUserList.some((user) => user.userId === message.userId)) {
          oUserList.push(userInfo);
          saveUserListToLocalStorage(oUserList);
        }
      }
      break;
    default:
      break;
  }
};

extensionSdk.chat.listen(handleChatInfoReceived);

// DOMContentLoaded: DOM 완전히 load 된 이후에 접근
document.addEventListener("DOMContentLoaded", function () {
  var statusElement = document.getElementById("status"); // 현재 상태 표시
  var startBtn = document.getElementById("start_btn"); // 시작버튼
  var endBtn = document.getElementById("end_btn"); // 종료버튼

  // 시작 버튼에 대한 이벤트 리스너
  startBtn.addEventListener("click", function () {
    if (currentState === "진행중") {
      alert("이미 진행중입니다");
    } else {
      console.log("시작");
      currentState = "진행중";
      statusElement.textContent = "현재상태: " + currentState;

      // 로컬 스토리지에서 'userList' 항목 제거
      localStorage.removeItem("userList");

      // 이미 설정된 타이머가 있다면 초기화
      clearTimeout(autoEndTimeout);

      // 5분 후 자동으로 종료
      autoEndTimeout = setTimeout(function () {
        console.log("자동 종료");
        currentState = "종료";
        statusElement.textContent = "현재상태: " + currentState;
      }, 300000); // 300,000밀리초 = 5분
    }
  });

  // 종료 버튼에 대한 이벤트 리스너
  var endBtn = document.getElementById("end_btn");
  endBtn.addEventListener("click", function () {
    console.log("종료");
    currentState = "종료"; // 상태를 '종료'로 변경

    // 로컬 스토리지에서 사용자 목록 불러오기
    const storedList = localStorage.getItem("userList");
    const userList = storedList ? JSON.parse(storedList) : [];

    // 콘솔에 사용자 목록 출력
    console.log("저장된 사용자 목록:", userList);
    statusElement.textContent = "현재상태: " + currentState;

    // 자동 종료 타이머 취소
    clearTimeout(autoEndTimeout);
  });

  // 추첨하기 버튼에 대한 이벤트 리스너
  var drawBtn = document.getElementById("draw_btn");
  var winner = document.getElementById("winner");
  drawBtn.addEventListener("click", function () {
    const oUserList = loadUserListFromLocalStorage();
    // 테스트용 임시 배열
    // let oUserList = [
    //   { userId: "user01", userNickname: "Nickname1" },
    //   { userId: "user02", userNickname: "Nickname2" },
    //   { userId: "user03", userNickname: "Nickname3" },
    //   { userId: "user04", userNickname: "Nickname4" },
    //   { userId: "user05", userNickname: "Nickname5" },
    // ];
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
});
