import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export async function POST(request : Request, ){
    await dbConnect();

    try {
        const {username, code} = await request.json();
        const decodedUser = decodeURIComponent(username);

        const user = await UserModel.findOne({username: decodedUser});
        if(!user){
            return Response.json(
                {
                    success: false,
                    message: "User not found"
                },
                {status: 404}
            );
        }
        
        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true;
            await user.save();
            return Response.json(
                {
                    success: true,
                    message: "User verified successfully"
                },
                {status: 200}
            )
        }
        else if(!isCodeNotExpired){
            return Response.json(
                {
                    success: false,
                    message: "Verification code is expired. Please sign up again to get a new code."
                },
                {status: 400}
            )
        }
        else{
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code."
                },
                {status: 400}
            )
        }
    } catch (error) {
        console.error('Error checking verification code:', error);
        return Response.json(
        {
            success: false,
            message: 'Error checking verification code',
        },
        { status: 500 }
        );
    }
}