import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import './index.css'
import RootLayout from "./RouteLayout";
import { Home } from "./pages/home";
import ErrorPage from "./pages/error-page";
import Master from "./pages/master";
import  Product  from "./pages/product";
import MasterIndex from "./pages/master-index";
import Size1 from "./pages/Size/Size";
import AddSize from "./pages/Size/AddSize";
import Gallery from "./pages/gallery";
import Inventory from "./pages/inventory";
import Barcode from "./pages/barcode";
import Billing from "./pages/billing";
import Billing2 from "./pages/camscan";


const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "/gallery",
        element: <Gallery/>
      },
      {
        path:"inventory",
        element:<Inventory/>
      },
      {
        path:"barcode",
        element:<Barcode/>
      },
      {
        path:"billing",
        element:<Billing/>
      },
      {
        path: "/master",
        element: <Master />,
        children: [
          {
            index: true,
            element: <MasterIndex/>,
          },
          
          {
            path: "product/",
            element: <Product />,
          },
          {
            path: "size/",
            element: <Size1/>,
          },
          {
            path: "size/addForm",
            element: <AddSize/>
            // loader: sizeLoader,
          },
        ]
      },
]}
]);
export default function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  )
}
