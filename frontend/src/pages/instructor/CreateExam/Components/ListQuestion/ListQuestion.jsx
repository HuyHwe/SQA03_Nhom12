import { DragDropContext, Draggable } from "@hello-pangea/dnd";
import { CustomDroppable } from "../../../../../components/CustomDroppable.jsx";
import { useState } from "react";

import CreateQuestion from "./CreateQuestion.jsx";
import QuestionItem from "./QuestionItem.jsx";
import ToolBarCreateExam from "./ToolBarCreateExam.jsx";

function ListQuestion( {
    moveQuestionExam, 
    questions,
    setAllQuestions,
    addQuestionExam,
    updateQuestionExam,
    removeQuestionExam,
    addAnswer,
    updateAnswer,
    removeAnswer
} ) {

    const [openPopupDetailQuestion, setOpenPopupDetailQuestion] = useState(false);
    const [questionIndex, setQuestionIndex] = useState(null);

    function togglePopup(index){
        setQuestionIndex(index);
        console.log("questionIndex:", index);
        setOpenPopupDetailQuestion(!openPopupDetailQuestion);
    }

    const handleDragEnd = (result) => {
            if (!result.destination) return;
            moveQuestionExam(result.source.index, result.destination.index);
        };
    
    return (
        <aside className="space-y-6 xl:sticky xl:top-24 h-fit">
            {/* Toolbar */}
            <ToolBarCreateExam addQuestionExam={addQuestionExam} setAllQuestions={setAllQuestions}/>

            {/* List */}
            <div className="rounded-2xl border bg-white overflow-hidden">
                <div className="grid px-5 py-3 text-base font-semibold text-gray-600 border-b bg-gray-50">
                    <div className="col-span-4">Câu hỏi</div>
                </div>

                <DragDropContext onDragEnd={handleDragEnd}>
                    <CustomDroppable droppableId="questions" 
                        isDropDisabled={false} 
                        isCombineEnabled={false}
                        ignoreContainerClipping={false}
                        direction="vertical"
                    >
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {(questions || []).map((item, index) => (
                                    <Draggable
                                        key={index}
                                        draggableId={`question-${index}`}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`rounded-lg border p-3 grid gap-2  ${
                                                    snapshot.isDragging ? "bg-gray-100" : ""
                                                }`}>

                                                <QuestionItem
                                                    item={item}
                                                    index={index}
                                                    updateQuestionExam={updateQuestionExam}
                                                    removeQuestionExam={removeQuestionExam}
                                                    togglePopup={togglePopup}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </CustomDroppable>
                </DragDropContext>
            </div>

            <CreateQuestion
                question={questions[questionIndex]}
                index={questionIndex}
                updateQuestion={updateQuestionExam}
                addAnswer={addAnswer}
                updateAnswer={updateAnswer}
                removeAnswer={removeAnswer}
                openPopupDetailQuestion={openPopupDetailQuestion} 
                setOpenPopupDetailQuestion={setOpenPopupDetailQuestion}
            />
        </aside>
    )
}

export default ListQuestion;