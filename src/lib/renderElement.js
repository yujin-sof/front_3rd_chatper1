// renderElement.js
import { addEvent, removeEvent, setupEventListeners } from './eventManager';
import { createElement__v2 } from "./createElement__v2.js";

// TODO: processVNode 함수 구현
function processVNode(vNode) {
  // vNode를 처리하여 렌더링 가능한 형태로 변환합니다.
  // - null, undefined, boolean 값 처리
  // - 문자열과 숫자를 문자열로 변환
  // - 함수형 컴포넌트 처리 <---- 이게 제일 중요합니다.
  // - 자식 요소들에 대해 재귀적으로 processVNode 호출


  if(!vNode || typeof vNode === 'boolean') {
    return document.createTextNode('')
  }

  if(typeof vNode === 'string' || typeof vNode === 'number') {
    return String(vNode)
  }

  if(typeof vNode.type === 'function') {
    //어렵다 함수형 컴포넌트..
    const result = vNode.type(vNode.props || {});
    return processVNode(result);
  }

  // 자식요소
  const proChildren = (vNode.children || []).map((child) => processVNode(child));

  return {
    type: vNode.type,
    props: vNode.props || {},
    children: proChildren,
  };

}


// TODO: updateAttributes 함수 구현

function updateAttributes(target, oldProps, newProps) {
  // DOM 요소의 속성을 업데이트합니다.
  // - 이전 props에서 제거된 속성 처리
  // - 새로운 props의 속성 추가 또는 업데이트
  // - 이벤트 리스너, className, style 등 특별한 경우 처리

  //   <이벤트 리스너 처리>
  //     - TODO: 'on'으로 시작하는 속성을 이벤트 리스너로 처리
  //     - 주의: 직접 addEventListener를 사용하지 않고, eventManager의 addEvent와 removeEvent 함수를 사용하세요.
  //     - 이는 이벤트 위임을 통해 효율적으로 이벤트를 관리하기 위함입니다.


  oldProps = oldProps || {};
  newProps = newProps || {};


  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key === 'className') {
        target.className = '';
      } else if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();

        removeEvent(target, eventName, oldProps[key]);
        // 새로운 이벤트 핸들러가 없으면 제거

      } else if (key === 'style') {
        Object.assign(target.style, {});
      } else {
        target.removeAttribute(key);
      }
    }
  }

  for (const [key, value] of Object.entries(newProps)) {
    if (value !== oldProps[key]) {
      if (key === 'className') {
        target.className = value;
      } else if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        addEvent(target, eventName, value);
      } else if (key === 'style') {
        Object.assign(target.style, value);
      } else {
        target.setAttribute(key, value);
      }
    }
  }

}

// TODO: updateElement 함수 구현
function updateElement(parent, newNode, oldNode, index = 0) {
  // 1. 노드 제거 (newNode가 없고 oldNode가 있는 경우)
  // TODO: oldNode만 존재하는 경우, 해당 노드를 DOM에서 제거
  if (!newNode && oldNode) {
    return parent.removeChild(parent.childNodes[index]);
  }

  // 2. 새 노드 추가 (newNode가 있고 oldNode가 없는 경우)
  // TODO: newNode만 존재하는 경우, 새 노드를 생성하여 DOM에 추가
  if (newNode && !oldNode) {
    return parent.appendChild(createElement__v2(newNode));
  }

  // 3. 텍스트 노드 업데이트
  // TODO: newNode와 oldNode가 둘 다 문자열 또는 숫자인 경우
  // TODO: 내용이 다르면 텍스트 노드 업데이트
  if ((typeof oldNode === "string" || typeof oldNode === "number") &&
     (typeof newNode === "string" || typeof newNode === "number")) {
    if (oldNode !== newNode) {
      return parent.replaceChild(createElement__v2(newNode), parent.childNodes[index])
    } 
    return;
  }

  // 4. 노드 교체 (newNode와 oldNode의 타입이 다른 경우)
  // TODO: 타입이 다른 경우, 이전 노드를 제거하고 새 노드로 교체
  if (newNode.type !== oldNode.type) {
    return parent.replaceChild(createElement__v2(newNode), parent.childNodes[index])
  }

  // 5. 같은 타입의 노드 업데이트

  // 5-1. 속성 업데이트
  // TODO: updateAttributes 함수를 호출하여 속성 업데이트
  updateAttributes(parent.childNodes[index], oldNode.props || {}, newNode.props || {});

  // 5-2. 자식 노드 재귀적 업데이트
  // TODO: newNode와 oldNode의 자식 노드들을 비교하며 재귀적으로 updateElement 호출
  // HINT: 최대 자식 수를 기준으로 루프를 돌며 업데이트
  const maxLength = Math.max(
    newNode.children.length,
    oldNode.children.length,
  );

  // 5-3. 불필요한 자식 노드 제거
  // TODO: oldNode의 자식 수가 더 많은 경우, 남은 자식 노드들을 제거
  for (let i = 0; i < maxLength; i++) {
    updateElement(
      parent.childNodes[index], 
      newNode.children[i], 
      oldNode.children[i], 
      i
    )
  }
}


// TODO: renderElement 함수 구현
export function renderElement(vNode, container) {
  // 최상위 수준의 렌더링 함수입니다.
  // - 이전 vNode와 새로운 vNode를 비교하여 업데이트
  // - 최초 렌더링과 업데이트 렌더링 처리

  // 이벤트 위임 설정
  // TODO: 렌더링이 완료된 후 setupEventListeners 함수를 호출하세요.
  // 이는 루트 컨테이너에 이벤트 위임을 설정하여 모든 하위 요소의 이벤트를 효율적으로 관리합니다.


  if (!container) return;
  
  // 새로운 노드 변수 
  const newVNode = processVNode(vNode);

  // 처음에는 false 일것
  if (container._vNode) {
    updateElement(container, newVNode, container._vNode);
  } else {
    container.appendChild(createElement__v2(newVNode));
  }

  // 다음 호출시 기존 노드로 담아줌
  container._vNode = newVNode;
  // 이벤트 위임 확인하기 어렵다..
  setupEventListeners(container);
}
