import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);
  return (
    <>
      <h3>Error</h3>
      <p>
        <i>{error.statusText || error.message}</i>
      </p>
    </>
  );
}
