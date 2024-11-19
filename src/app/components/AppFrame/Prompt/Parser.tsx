import { countNumberOfOccurrences, filter } from "../Common/Utils";

let vars = {};
const INVALID_COMMAND_MESSAGE = "Invalid usage! Type 'help' for assistance.";

export const parse = (cmd, log, updateLog, updateCmd) => {

    const rgx =
    {
        variableDecl: /\s*([a-z]+)\s*=\s*\[(.*)\]\s*$/,
        listVariables: /^\s*list\s*$/,
        clearVariables: /^\s*reset\s*$/,
        filter: /^\s*filter\s*\((.*)\)\s*$/
    }

    const patterns = [
        { regex: /^\s*clear\s*$/, action: () => updateLog(["Cleared..."]) },
        { regex: /^\s*help\s*$/, action: () => help(log, updateLog) },
        { regex: /^\s*version\s*$/, action: () => version(log, updateLog) },
        { regex: rgx.variableDecl, action: () => declareVariable(rgx.variableDecl, cmd, log, updateLog) },
        { regex: rgx.listVariables, action: () => listVariables(log, updateLog) },
        { regex: rgx.clearVariables, action: () => clearVariables(log, updateLog) },
        { regex: rgx.filter, action: () => execFilter(rgx.filter, cmd, log, updateLog) },
    ];

    for (let i = 0; i < patterns.length; i++) {
        if (patterns[i].regex.test(cmd)) {
            patterns[i].action();
            break;
        }
        if (i == patterns.length - 1) cmdNotFound(cmd, log, updateLog);
    }

    updateCmd("");
}

const help = (log, updateLog) => {
    const text = [
        "\n",
        "FilterDesigner version 0.2",
        "Available commands:",
        "\t 'help' - Shows the help message",
        "\t 'version' - Shows the web apps version",
        "\t 'clear' - Clears the screen.",
        "\t 'reset' - Deletes the declared variables in your session.",
        "\nVariable decleration:",
        "\t a = [x y z] - Declares a list named 'a' with the elements x, y and z.",
        "\nAvailable methods:",
        "\t'filter(x,a,b)' - Performs filtering on the input 'x', with the coefficients of its transfer function \n\tdefined using the list 'a' for the numerator and the list 'b' for the denominator."
    ];
    updateLog(log.concat(text));
}

const cmdNotFound = (cmd, log, updateLog) => {
    const text = [
        "Command '" + cmd + "' not found! Enter 'help' for addtional information."
    ];
    updateLog(log.concat(text));
}

const version = (log, updateLog) => {
    const text = ["\n", "Version 0.2 - Nov 19 2024"]
    updateLog(log.concat(text));
}

const declareVariable = (rgx, cmd, log, updateLog) => {
    const match = rgx.exec(cmd);

    const key = match[1];
    const values = match[2];

    vars[key] = values.split(/\s+/);

    const text = ["\n", `> ${key} = [${values}]`]
    updateLog(log.concat(text));

}

const listVariables = (log, updateLog) => {
    const text = [
        "Active variables: ", JSON.stringify(vars).replace(/"/g, '')
    ];
    updateLog(log.concat(text));
}

const clearVariables = (log, updateLog) => {
    vars = {};
    const text = ["Variables cleared", JSON.stringify(vars).replace(/"/g, '')]
    updateLog(log.concat(text));
}

const execFilter = (rgx, cmd, log, updateLog) => {

    const match = rgx.exec(cmd);
    const expr = match[1];
    if (countNumberOfOccurrences(expr, ",") != 2) {
        const text = ["\n", INVALID_COMMAND_MESSAGE]
        console.log(countNumberOfOccurrences(expr, ","))
        updateLog(log.concat(text));
        return;
    }
    let den = [];
    let num = [];
    let x = [];

    const args = expr.split(",");
    let m_var = args[0].match(/\s*([a-zA-Z])+\s*/);
    let m_brac = args[0].match(/\s*\[(.*)\]\s*/);
    if (m_var && m_var[1] !== undefined) {
        x = vars[m_var[1]];
    } else if (m_brac) {
        x = m_brac[1].split(/\s+/)
    }

    m_var = args[1].match(/\s*([a-zA-Z])+\s*/);
    m_brac = args[1].match(/\s*\[(.*)\]\s*/);
    if (m_var && m_var[1] !== undefined) {
        num = vars[m_var[1]];
    } else if (m_brac) {
        num = m_brac[1].split(/\s+/)
    }

    m_var = args[2].match(/\s*([a-zA-Z])+\s*/);
    m_brac = args[2].match(/\s*\[(.*)\]\s*/);
    if (m_var && m_var[1] !== undefined) {
        den = vars[m_var[1]];
    } else if (m_brac) {
        den = m_brac[1].split(/\s+/)
    }

    const text = ["\n", "[" + filter(x, { den: den, num: num }).toString() + "]"]
    updateLog(log.concat(text));
}