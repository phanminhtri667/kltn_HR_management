import './selectField.scss';
// import '../../../assets/css/variables.scss';
const SelectField = ({ ...props }) => {
    const { name, onChange, errorMessage, data,value,isDisabled } = props;
    const option: Record<string,any>[] = data || []

    return (
        <>
            {name && <label className='select-label fs-s'>{name}</label>}
            {errorMessage && (
                <span className="fs-s error-text ml-1">{errorMessage}</span>
            )}
            <select onChange={onChange} className='select-field' value={value} disabled={isDisabled}>  
            <option value='' className='option-default'>Choose {name.toLowerCase()}</option>
               {option.length > 0 && option.map((item,index) => {
                return (
                     <option key={index} value={item.code} >{item.value}</option>
                )
               })}
            </select>
        </>
    );
};


export default SelectField;