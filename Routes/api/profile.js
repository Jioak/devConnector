const express=require('express')
const router=express.Router();
const request=require('request')
const config=require('config')
const auth=require('../../middleware/auth');
const Profile=require('../../models/Profile');
const User= require('../../models/User')
const { check, validationResult } = require('express-validator')
const Post=require('../../models/Post')



router.get('/me',auth,async (req,res)=>{

    try {

        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name,avatar']);

        if(!profile){
            return res.status(400).json({msg:'There is no profile for this user'})
        }

        res.json(profile)
        
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server Error')
        
    }
})
// @route    POST api/profile
// @desc     Create or update user profile
// @access   Private


router.post('/',[auth,[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty()
]], async (req,res)=> {

    const errrors=validationResult(req);
    if(!errrors.isEmpty()){
        return res.status(400).json({errors:errrors.array()})
    }

    const {
        website,
        skills,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
        bio,
        location,
        status,
        company,githubusername

     
        // spread the rest of the fields we don't need to check
        
      } = req.body;


      //build profile object
      const profileFields={};

      profileFields.user=req.user.id;

if(company) profileFields.company=company;
if(website) profileFields.website=website;
if(location) profileFields.location=location;
if(bio) profileFields.bio=bio;
if(status) profileFields.status=status;
if(githubusername) profileFields.githubusername=githubusername;

if(skills){
    profileFields.skills=skills.split(',').map(skill =>skill.trim());


}

//Build social object
profileFields.social={};
if(youtube) profileFields.social.youtube=youtube;
if(twitter) profileFields.social.twitter=twitter;
if(facebook) profileFields.social.facebook=facebook;
if(linkedin) profileFields.social.linkedin=linkedin;
if(instagram) profileFields.social.instagram=instagram;


try {

    let profile= await Profile.findOne({user:req.user.id});

    if(profile){
        profile=await Profile.findOneAndUpdate({user:req.user.id},
            {$set:profileFields},{
                new:true
            })
            return res.json(profile)
    }

    profile=new Profile(profileFields);
    await profile.save();
    res.json(profile)
    
} catch (error) {

    console.error(error.message);
    res.status(500).send('server error')
    
}


console.log(profileFields.skills)



res.send('hello')




})

// @route    GET api/profile
// @desc     Get all  profile
// @access   Public

router.get('/',async (req,res)=>{

    try {

        const profiles=await Profile.find().populate('user',['name','avatar']);
        res.json(profiles)

        
    } catch (error) {
         console.error(error.message);
 res.status(500).send('server error')
 
    }
})


// @route    GET api/profile/user/:user_id
// @desc     Get profile by user id
// @access   Public
router.get('/user/:user_id',async (req,res)=>{

    try {

        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);

        if(!profile)
        return res.status(400).json({msg:"There is no profile for this user"})

        res.json(profile)

        
    } catch (error) {
         console.error(error.message);
         if(error.kind=='ObjectId'){
            return res.status(400).json({
                msg:'Profile not found'
            })
         }
 res.status(500).send('server error')
 
    }
})

// @route    Delete api/profile
// @desc     delete profile user &posts
// @access   Private

router.delete('/',auth,async (req,res)=> {

try {

    await Post.deleteMany({user:req.user.id})
    //Remove profile 
    await Profile.findOneAndDelete({user:req.user.id});

    //Remove user
    await User.findOneAndDelete({_id:req.user.id})
    
    res.json('User deleted')
} catch (error) {
    console.error(error.message);
    res.status(500).send('server error')
}
})

// @route   Put api/profile/experience
// @desc     Add profile experience
// @access   Private



router.put('/experience',[auth,[
    check('title','title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From date is Required').not().isEmpty()

]],async (req,res)=>{
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {title,company,location,from,to,current,description}=req.body;

    const newExp={title,company,location,from,to,current,description

    }
    try {
        const profile=await Profile.findOne({user:req.user.id})
        profile.experience.unshift(newExp);
       await profile.save()

       res.json(profile)
        
    } catch (error) {

        console.error(error.message);
        res.status(500).send('server error')
        
    }

})

// @route   delete api/profile/experience/:exp_id
// @desc     delete profile experience
// @access   Private

router.delete('/experience/:exp_id',auth, async(req,res)=>{

    try {

        const profile=await Profile.findOne({user:req.user.id});

        const removeIndex=profile.experience.map(item =>item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex,1);

        await profile.save();
        res.json(profile)

        
    } catch (error) {
           console.error(error.message);
   res.status(500).send('server error')
   
    }

})

// @route   put education
// @desc     Add profile education
// @access   Private
router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','degree is required').not().isEmpty(),
    check('fieldofstudy','Field of study is Required').not().isEmpty()

]],async (req,res)=>{
    const errors=validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

    const {school,degree,fieldofstudy,from,to,current,description}=req.body;

    const newEdu={school,degree,fieldofstudy,from,to,current,description

    }
    try {
        const profile=await Profile.findOne({user:req.user.id})
        profile.education.unshift(newEdu);
       await profile.save()

       res.json(profile)
        
    } catch (error) {

        console.error(error.message);
        res.status(500).send('server error')
        
    }

})


// @route   delete api/profile/education/:edu_id
// @desc     delete profile education
// @access   Private

router.delete('/education/:edu_id',auth, async(req,res)=>{

    try {

        const profile=await Profile.findOne({user:req.user.id});

        const removeIndex=profile.education.map(item =>item.id).indexOf(req.params.exp_id);

        profile.education.splice(removeIndex,1);

        await profile.save();
        res.json(profile)

        
    } catch (error) {
           console.error(error.message);
   res.status(500).send('server error')
   
    }

})


// @route   Get api/profile/github/:username
// @desc     get user repos from githb

// @access   Public

router.get('/github/:username', (req,res)=>{

    try {

        const options={
            url:`https://api.github.com/users/${req.params.username}/repos?per_page=5&
            sort=created:asc&client_id=${config.get('githubClientId')}&client_secret=${config.get('githubSecret')}`,
            method:'GET',
            headers:{'user-agent':'node.js'}
        }

        request(options,(error,response,body)=> {
            if(error)
            console.log(error);
        if(response.statusCode !== 200){
        res.status(404).json({msg:'No Github profile found'})
        }

        res.json(JSON.parse(body))
        })
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send('server error')
    }
})



module.exports=router
