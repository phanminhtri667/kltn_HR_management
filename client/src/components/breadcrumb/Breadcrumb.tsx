import { Link, useLocation } from "react-router-dom";
import './Breadcrumb.scss'


const Breadcrumb = () => {
    const location = useLocation();
    const pathName = location.pathname.split("/").filter((x) => x);
    const name = pathName[0]
    // const routeTo = `/${pathName}`;
    // console.log(routeTo);
    
    // console.log(pathName);
    
  return (
    pathName.length > 1 ? <nav>
      <div className="breadcrumb">

      <span>
            <Link className=" breadcrumb-item" to={ `/${name}` }>{ name } </Link>
            <i className="pi pi-chevron-right fs-s ml-2" ></i>
        </span>

        <span className="ml-2 breadcrumb-item active" >{ name  } Edit</span>
          
      
        
      </div>
    </nav> : null
  );
};

export default Breadcrumb;
