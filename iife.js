/**
 * Example of a iife-class (base class)
 */

var exampleClass = ( function(){

     /**
      * Protected Kindof Static value. Not available outsite object but available in childobjects. 
      * Value is not really static, it can be changed, but ONLY from the base-class, not in child-classes. 
      * In all childobjects the value point to the base-class so you can not use it for singleton patterns  
      *
      * If you'd remove the var declaration you'd essentially create a global variable; YOU DON't WANT THAT 
      * @type {[type]}
      * @access protected
      */
     var _staticProtectedVariable = Math.random();

     /**
      * Protected static method, has no reference to 'this' and is not available to public, IS available to childobjects
      * Could not think of a use for this kind of object, possible for singletons which won't pollute global (but that needs to be checked)
      * @return {[type]} [description]
      */
     staticProtectedClassMethod = function(){
          console.log('staticProtectedClassMethod', _staticProtectedVariable, this._instID) ; // this._instID does not exist because this is a static method

     }

     /** Constructor **/
     function cls(arg1, arg2){
          // check arguments tertinary style with possibility to assign default values
          // Variables are PRIVATE 
          this._arg1 = (typeof arg1 === "undefined") ? '': arg1;
          this._arg2 = (typeof arg2 === "undefined") ? '': arg2;
          
          // other private instance variables, _instID is  use to distinguish instances from eachother
          this._instID = parseInt(Math.random() * 10000000);
          
          console.log("Constructor of instance " + this._instID + " was called");

          /**
           * Private instance method, unavailable outside class and unavailable to child objects (however you CAN make them available, see example child-class below)
           * @return {[type]} [description]
           */
          this.privateInstanceMethod = function(){
               console.log('privateInstanceMethod', this._instID);
          }

     }

     /**
      * This method acts as class method.. You could use this for an objectfacotry or utility-methods 
      * These methods are NOT available to childobjects! They are not part of the prototype.
      * @return {[type]} [description]
      */
     cls.classMethod = function(){ 
         console.log("classMethod", this._instID); // this does not exist in this scope!

         // If you'd like to return an object of instance exampleClass you can do;
         // return new exampleClass();
     }

     /**
      * public instance methods, added to the prototype of this object.
      */
     cls.prototype = {
          /** you NEED to set this, also in childobjects to be able to check instancetype by using instanceOf */
          constructor : cls,

          /**
           * Normal public instancen method
           */
          publicInstanceMethod : function(){
               console.log('publicInstanceMethod', this._instID);
               console.log("_staticProtectedVariable :: ", this._instID , _staticProtectedVariable);
               
               // call a private method;
               this.privateInstanceMethod();
          },

          somePublicMethod : function(){
               console.log("This is somePublicMethod which only exists in the base-class")
          }

     }

     // class/constructor is returned/exposed
     return cls;

}());     


/**
 * Example of a child class that inherits from  exampleClass
 */


var inheritedClass = (function(){

     /** 
      * Assigning a value to this variable will not work, it's value was defined in the parent class and cannot be changed
      */
     //var _staticProtectedVariable = "BLAAA";

     /** Constructor **/
     function cls(arg1, arg2){
          /**
           * next statement essentially calls the constructor of the parent class, 
           * passes along the arguments and loads the private methods that the base-class has.
           * Doing this makes the private methods protected (causes this class to allow usage)
           */
          exampleClass.apply(this, arguments); 

          // ofcourse you can implement your own constructor

     }

     /** 
      * Setup inheritance.. This class' prototype inherits the prototype of exampleClass
      */
     cls.prototype = Object.create(exampleClass.prototype);

     /**
      * Assign cls as constructor variable so you can use this in instanceOf
      */
     cls.prototype.constructor = cls;

     /**
      * create a reference to the parent-class so instance methods can use this to modify partial behaviour of the class
      */
     cls.super = exampleClass.prototype; 



     /**
      * Overridden from base-class. However; by using this.super you can call the same method of the baseclass
      * @return {[type]} [description]
      */
     cls.prototype.publicInstanceMethod = function(){
          console.log("This publicInstanceMethod is called from a child class with instID ", this._instID);
          // call the publicInstanceMethod of the base-class
          cls.super.publicInstanceMethod.apply(this);

     }
     
     // class/constructor is returned/exposed
     return cls;
})();


/**
 * Next up; a child class that inherits from a child class, now without comments and basically NO modifications to it's implementation
 */
var childOfChildClass = (function(){
     function cls(arg1, arg2){
          inheritedClass.apply(this, arguments); 
     }
     cls.prototype = Object.create(inheritedClass.prototype);
     cls.prototype.constructor = cls;
     cls.super = inheritedClass.prototype;     
     cls.prototype.publicInstanceMethod = function(){
          console.log("This publicInstanceMethod is called from a secondchild class with instID ", this._instID);
          // call the publicInstanceMethod of the base-class
           inheritedClass.super.publicInstanceMethod.apply(this, arguments); 
          //this.super.publicInstanceMethod.apply(this);

     }
     return cls;
})()

/**
 * ok.. so it's some lines of code to get inheritance up & running with reference to their superclass.. This CAN be refactored to a global function (and we will)
 * However; the idea was to write unobtrusive objects that do not pollute the global scope and do not need any global defined methods to get the features we want.
 * We did succeed for now, but a utility method would mbe nice:

 */

function extend(base, child, methods){
     child.prototype = Object.create(base.prototype);
     child.prototype.constructor = child;
     child.super = base.prototype;
     for (var name in methods) {
          child.prototype[name] = methods[name];
     }     
     return child;
}

/** 
 * Let's try to use this extend method on another child class
 */

var inheritedByUsingExtendFunction = (function(){

     function cls(arg1, arg2){
          cls.super.constructor.apply(this, arguments);
     }

     extend(childOfChildClass, cls, {
          publicInstanceMethod : function(){
               console.log("This publicInstanceMethod is called from a third child class with instID ", this._instID);
               // call the publicInstanceMethod of the base-class
                cls.super.publicInstanceMethod.apply(this, arguments); 

          }
     })

     return cls;
})()