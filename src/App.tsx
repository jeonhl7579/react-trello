import { DragDropContext, DropResult, Droppable } from "react-beautiful-dnd";
import { Snapshot, useRecoilState, useRecoilValue } from "recoil";
import styled from "styled-components";
import { toDoState } from "./atoms";
import Board from "./Components/Board";
import { useMemo, useEffect, useState } from "react";

const Wrapper = styled.div`
  display: flex;
  width: 100%;
  margin: 0 auto;
  padding: 0px 10rem;
  justify-content: center;
  align-items: center;
  height: 100vh;
  z-index: 100;
`;

const ModalWrapper = styled.div`
  z-index: 102;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  margin: 0 auto;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Modal = styled.div`
  z-index: 150;
  width: 220px;
  height: 200px;
  background-color: #aaa69d;
  box-shadow: 5px 5px 5px;
  opacity: 1;
  border-radius: 5px;

  img {
    position: relative;
    top: -10px;
    left: 220px;
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
  div {
    width: 100%;
    display: flex;
    flex-direction: column;

    span {
      text-align: center;
      margin-bottom: 15px;
      color: white;
      font-weight: bold;
    }

    input {
      width: 90%;
      font-size: 18px;
      margin: 0 auto;
      padding-top: 5px;
      padding-bottom: 5px;
      border: none;
      color: white;
      border-bottom: solid #cad3c8 2px;
      text-align: center;
      background: none;
    }
  }
`;

const Boards = styled.div`
  display: grid;
  width: 100%;
  height: 400px;
  gap: 10px;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
`;

const AddBoard = styled.div`
  width: 220px;
  height: 400px;
  border-radius: 5px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(128, 142, 155, 0.3);

  transition: 0.3s;
  &:hover {
    box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22);
  }

  img {
    width: 60px;
    height: 60px;
    pointer-events: none;
    opacity: 0.5;
  }
`;
const LocalMenuContainer = styled.div`
  width: 20%;
  height: 50px;
  position: fixed;
  top: 1%;
  right: 1rem;
  margin: 0 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

const LocalButton = styled.button`
  width: 40px;
  height: 40px;
  margin-right: 25px;
  background-color: #34495e;
  border: none;
  border-radius: 5px;
  transition: 0.2s;
  cursor: pointer;
  &:hover {
    background-color: #ecf0f1;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: scale-down;
    opacity: 0.8;
    transition: 0.2s;
    filter: invert(99%) sepia(2%) saturate(3023%) hue-rotate(58deg)
      brightness(117%) contrast(87%);

    &:hover {
      filter: invert(27%) sepia(20%) saturate(867%) hue-rotate(169deg)
        brightness(89%) contrast(91%);
    }
  }
  &::after {
    height: 100%;
    left: 0;
    top: 0;
    width: 0;
  }
  &::after:hover {
    width: 100%;
  }
`;

const RecycleContainer = styled.div`
  width: 50px;
  height: 50px;
  bottom: 2rem;
  right: 2rem;
  position: fixed;
  margin: 0 auto;

  button {
    width: 100%;
    height: 100%;
  }
`;

function App() {
  const [toDos, setToDos] = useRecoilState(toDoState);
  const [toDoFlag, setToDoFlag] = useState(false);
  const [modal, setModal] = useState(false);
  const [modalToDo, setModalToDo] = useState("");

  useMemo(() => {
    const localToDos = window.localStorage.getItem("toDos");
    if (localToDos) {
      let result = JSON.parse(localToDos);
      setToDos(result);
    }
  }, []);
  useEffect(() => {
    const toDoLen = Object.keys(toDos).length;
    if (toDoLen >= 5) setToDoFlag(true);
    else setToDoFlag(false);
  }, [toDos]);
  const onDragEnd = (info: DropResult) => {
    console.log(info);
    const { destination, source, draggableId } = info;
    console.log(toDos[source.droppableId][source.index]);
    if (!destination) return;
    if (destination.droppableId === "trash") {
      console.log(info);
      // 삭제 할때는
      // 대상이 되는 보드에서 대상 제거
      // 끝
      setToDos((allBoards) => {
        const boardCopy = [...allBoards[source.droppableId]];
        boardCopy.splice(source.index, 1);
        return {
          ...allBoards,
          [source.droppableId]: boardCopy,
        };
      });
    } else {
      if (destination?.droppableId === source.droppableId) {
        // same board movement.
        setToDos((allBoards) => {
          const boardCopy = [...allBoards[source.droppableId]];
          const taskObj = boardCopy[source.index];
          console.log(allBoards);
          boardCopy.splice(source.index, 1);
          boardCopy.splice(destination.index, 0, taskObj);
          // allBoards는 전체인 3개의 보드
          // [source.droppableId]는 드래그 되고 있는 보드의 이름
          return {
            ...allBoards,
            [source.droppableId]: boardCopy,
          };
        });
      }
      if (destination.droppableId !== source.droppableId) {
        // cross board movement
        setToDos((allBoards) => {
          const sourceBoard = [...allBoards[source.droppableId]];
          const destinationBoard = [...allBoards[destination.droppableId]];
          const taskObj = sourceBoard[source.index];
          sourceBoard.splice(source.index, 1);
          destinationBoard.splice(destination?.index, 0, taskObj);
          return {
            ...allBoards,
            [source.droppableId]: sourceBoard,
            [destination.droppableId]: destinationBoard,
          };
        });
      }
    }
  };
  const onModalClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setModal((cur) => !cur);
    setModalToDo("");
  };
  const onModalChange = (event: React.FormEvent<HTMLInputElement>) => {
    setModalToDo(event.currentTarget.value);
  };
  const onModalSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const toDosArr = Object.keys(toDos);

    console.log(modalToDo);
    if (toDosArr.includes(modalToDo)) {
      alert("이미 있는 보드입니다.");
      setModalToDo("");
    } else {
      setToDos((allBoards) => {
        return {
          ...allBoards,
          [modalToDo]: [],
        };
      });
      setModal((cur) => !cur);
    }
  };
  const onNewClick = () => {
    setToDos({
      to_do: [],
      doing: [],
      done: [],
    });
  };
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Wrapper>
        <LocalMenuContainer>
          <LocalButton onClick={onNewClick}>
            <img src={require("./img/bring.png")} />
          </LocalButton>
        </LocalMenuContainer>

        <Boards>
          {Object.keys(toDos).map((boardId) => (
            <Board boardId={boardId} key={boardId} toDos={toDos[boardId]} />
          ))}
          {!toDoFlag ? (
            <AddBoard onClick={onModalClick}>
              <img src={require("./img/더하기.png")} />
            </AddBoard>
          ) : null}
        </Boards>
      </Wrapper>
      {modal ? (
        <ModalWrapper>
          <Modal>
            <img src={require("./img/exit.png")} onClick={onModalClick} />
            <form onSubmit={onModalSubmit}>
              <div>
                <span>CREATE NAME</span>
                <input
                  type="text"
                  onChange={onModalChange}
                  value={modalToDo}
                ></input>
              </div>
            </form>
          </Modal>
        </ModalWrapper>
      ) : null}

      <Droppable droppableId="trash">
        {(magic, snapshot) => (
          <RecycleContainer ref={magic.innerRef}>
            <LocalButton type="button">
              <img src={require("./img/휴지통.png")} />
            </LocalButton>
          </RecycleContainer>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default App;
