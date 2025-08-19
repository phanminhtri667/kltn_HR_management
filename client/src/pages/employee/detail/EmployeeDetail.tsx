import DefaultLayout from '../../../layouts/DefaultLayout';
import { useParams } from 'react-router-dom';
const EmployeeDetail = ({...props}) => {
    const params = useParams().employeeId;
    return(
        <>
            <DefaultLayout>
                <span>{params}</span>
            </DefaultLayout>
        </>
    )
}

export default EmployeeDetail