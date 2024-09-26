export const userStatus = () => {
    const status = {
      isLogin: false,
      userInfo: null,
    }
  
    const getIsLogin = () => status.isLogin // 로그인 여부 확인용
  
    const getUserInfo = () => status.userInfo // 프로필에 유저정보 저장용
  
    // 프로필 내용 업데이트하면 유저정보 저장, 로컬스토리지에 저장
    // 스프레드 연산자, 객체 복사 및 병합
    const update = (newUserInfo) => {
      status.userInfo = { ...newUserInfo }
      localStorage.setItem("user", JSON.stringify(newUserInfo))
    }
  
    // 로그인하면 상태는 true, 유저정보 저장, 로컬스토리지에 저장
    const login = (userInfo) => {
      status.isLogin = true
      status.userInfo = { ...userInfo }
      localStorage.setItem("user", JSON.stringify(userInfo))
    }
  
    // 로그아웃하면 상태는 false, 유저정보 삭제, 로컬스토리지도 삭제
    const logout = () => {
      status.isLogin = false
      status.userInfo = null
      localStorage.removeItem("user")
    }

    
  
    return { getIsLogin, getUserInfo, update, login, logout }
  }
  