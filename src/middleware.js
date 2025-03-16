const answers = {
    1: 8,
    2: NaN,
    3: NaN,
    4: NaN
};

const cookieAnswers = {
    1: 8,
    2: "O8bF2sF9vDhM5Sdisjgz1z3KBuQOAVJnIfgGydOCXoTHeBJrgXuIgcPhInaZlBBXwHKjWUMYIwjEcJqO0L5rUBkDBLP445Ckyl3k",
    3: "g9ywP5Xs6Mu6m6LI2Hingjuy7PLCRyXfFYrcpdsdc0p3HTRmh4ICE5NJp0PgOyiJVrj4QOudtVSAuHaDVu9OfCKhSrheEA0VIMXK",
    4: "IjkGhyNDWVQGVUaEqpfaZ6QqGPqhiUvo44JUT29hFdllJRIDDSAVihuDDPRy3XYq1dDnqT2cLuCdT5fGv4RfzO4o3RwKaP6d9nmE"
}

export function onRequest(context, next) {
    // Intercept data from the request and check the method
    const { request } = context;
    const { method, url } = request;
    // we leave trimming for later :)
    const cookies = context.request.headers.get('cookie')?.split(";");
    // console.log(request);

    // Ban all direct requests to the levels and win themselves
    if (method === "GET" && /\/(?!1$)\d+$/.test(url)) {
        let matches = url.match(/\/(?!1$)\d+$/);

        if (matches.length != 1) {
            return next()
        }

        let match = matches[0];
        // so match has a slash at the beginning... we need to ignore it, hence the substring(1).
        let previousURL = parseInt(match.substring(1)) - 1;

        // if (isNaN(answers[previousURL])) {
        //     return next();
        // }

        // check cookies if they already have the correct answer
        for (let i in cookies) {
            // if (cookies[i].trim().startsWith(`answer${previousURL}=`)) {
            //     console.log(cookies[i])
            //     console.log(`answer${previousURL}=`);
            //     console.log("Current cookie answer:", cookies[i].substring((`answer${previousURL}=`).length));
            //     console.log("Expected answer:", cookieAnswers[previousURL])
            // }

            // console.log(cookies[i].trim().startsWith(`answer${previousURL}=`));
            // console.log(cookies[i].substring((`answer${previousURL}=`).length + 1) == cookieAnswers[previousURL]);
            if (cookies[i].trim().startsWith(`answer${previousURL}=`) && cookies[i].trim().substring((`answer${previousURL}=`).length) == cookieAnswers[previousURL]) { // correct answer stored in cookie?
                // console.log("COOKIES!!!!");
                return next();
            }
        }

        // console.log("someone's cheating...")
        return new Response("STOP CHEATING.", { status: 403 });
    }

    // For POST requests, check if it's targeting level 2 or 3
    // HAHA this is a small website so /2 will not cause unexpected behaviour
    if (method === "POST") {
        let matches = url.match(/\/(?!1$)\d+$/);

        if (matches.length != 1) {
            return next()
        }

        let match = matches[0];
        let currentLevelNumber = parseInt(match.substring(1));

        if (request.data?.answer == answers[match]) {
            // correct answer?
            // console.log(url)
            // WARNING: url may be the incorrect url??
            let res = new Response('OK', {
                status: 200,
                statusText: 'OK',
            });

            res.headers.append('Set-Cookie', `answer${currentLevelNumber}=${cookieAnswers[currentLevelNumber]}; ` +
                `Max-Age=${60 * 1}; ` + // cookies last for 1min
                `Path=${"/"}; ` +
                `SameSite=Strict;`);

            return res;
        } else {
            // incorrect answer?
            return new Response("WRONG ANSWER.", { status: 403 });
        }
    }

    // console.log("boring old...");
    return next();
};