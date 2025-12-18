import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode: number }) {
    return (
        <p>
            {statusCode
                ? `An error ${statusCode} occurred on server`
                : 'An error occurred on client'}
        </p>
    );
}

export const config = { runtime: 'experimental-edge' };

Error.getInitialProps = ({ res, err }: NextPageContext) => {
    const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
    return { statusCode };
};

export default Error;
