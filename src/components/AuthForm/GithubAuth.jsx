import { Flex, Text } from "@chakra-ui/react"
import { useSignInWithGithub } from "react-firebase-hooks/auth";
import { FaGithub } from "react-icons/fa";
import { auth, firestore } from "../../firebase/firebase";
import useShowToast from "../../hooks/useShowToast";
import useAuthStore from "../../store/authStore";
import { doc, getDoc, setDoc } from "firebase/firestore";

const GithubAuth = ({prefix}) => {
    const [signInWithGithub, user, loading, error] = useSignInWithGithub(auth);
    const showToast = useShowToast();
    const loginUser = useAuthStore((state) => state.login);

    const handleGithubAuth = async () => {
        try {
            const newUser = await signInWithGithub()
            if (!newUser && error) {
                showToast("Error", error.message, "error")
                return
            }
            const userRef = doc(firestore, "users", newUser.user.uid);
            const userSnap = await getDoc(userRef);

            if(userSnap.exists()){
                // login
                const userDoc = userSnap.data();
                localStorage.setItem("user-info", JSON.stringify(userDoc));
                loginUser(userDoc);
              } else {
                // signup
                const userDoc = {
                  uid:newUser.user.uid,
                  email:newUser.user.email,
                  username:newUser.user.email.split("@")[0],
                  fullName:newUser.user.displayName,
                  bio:"",
                  profilePicURL:newUser.user.photoURL,
                  followers:[],
                  following:[],
                  posts:[],
                  createdAt:Date.now()
              }
              await setDoc(doc(firestore, "users", newUser.user.uid), userDoc);
              localStorage.setItem("user-info",JSON.stringify(userDoc));
              loginUser(userDoc)
              }
              
        } catch (error) {
            showToast("Error", error.message, "error")
        }
    }
  return (
    <Flex alignItems={"center"} justifyContent={"center"} cursor={"pointer"} onClick={handleGithubAuth}>
      <FaGithub  size={20}/>
      <Text mx='2' color={"blue.500"}>
        {prefix} with Github
      </Text>
    </Flex>
  )
}

export default GithubAuth
