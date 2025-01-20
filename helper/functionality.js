import bcrypt from "bcrypt";

const hashPassword = async (plainPassword, saltRounds) => {
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    return hashedPassword;
};

const comparePassword = async (plainPassword, hashedPassword) => {
    try {
        const result = await bcrypt.compare(plainPassword, hashedPassword);
        return result;
    } catch (err) {
        throw err;
    }
};

export default { hashPassword, comparePassword };
