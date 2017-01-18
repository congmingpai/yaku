import _ from "./_";
import genIterator from "./genIterator";
import Promise from './yaku'

var tryErr = {
    err: null
};

function tryCatch (step, key) {
    try {
        return step(key);
    } catch (err) {
        tryErr.err = err;
        return tryErr;
    }
}

export default (limit, list) => {
    if (!_.isNumber(limit)) {
        list = limit;
        limit = Infinity;
    }

    return <any> new Promise((resolve, reject) => {
        var running = 0;
        var gen = genIterator(list);
        var done = false;

        function genNext () {
            running--;
            return step("next");
        }

        function genThrow (reason) {
            running--;
            return reject(reason);
        }

        function step (key): any {
            if (done) {
                if (running === 0)
                    resolve();
                return;
            }

            while (running < limit) {
                var info = gen[key]();

                if (info.done) {
                    if (running === 0) resolve();
                    return done = true;
                } else {
                    running++;
                    Promise.resolve(info.value).then(genNext, genThrow);
                }
            }
        }

        var ret = tryCatch(step, "next");

        if (ret === tryErr)
            reject(ret.err);
    });
};