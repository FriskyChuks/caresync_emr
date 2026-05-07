import React from "react";

const SubmitButton = ({title}) => {
  const title = ''

//   return <>{formatter.format(amount)}</>;
  return (
    <>
        <div className="d-flex justify-content-end mt-4">
            <button type="submit" className="btn btn-outline-primary rounded-5">
                {title}
            </button>
        </div>
    </>
    );
};

export default SubmitButton;