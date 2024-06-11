var StemiUserModel = require('../api/models/user_management.model');


exports.SocketRegister = function (socket, token) {
   if (token !== null && token !== '' && token !== 'null' && token !== undefined ) {
      StemiUserModel.LoginHistorySchema.findOne({LoginToken: token, Active_Status: true, If_Deleted: false})
      .exec( function(err, res) {
         if (err || res === null) {
            socket.emit('Alert', 'Dot`t Try This Type of Hacking!');
         } else {
            const SocketId = socket.id;
            const SocketAvailable = res.SocketHistory.findIndex(obj => obj.SocketId === SocketId);
            if (SocketAvailable === -1) {
               StemiUserModel.LoginHistorySchema.updateOne(
                  {LoginToken: token, Active_Status: true, If_Deleted: false},
                  { $push: {
                     "SocketHistory": {
                        SocketId: SocketId,
                        SocketKey: '',
                        SocketConnected: true,
                        SocketStart: new Date(),
                        SocketEnd: null } } }
               ).exec(function(err_1, res_1) {
                  if (err_1) {
                     socket.emit('Alert', 'Socket Update Failed!');
                  } else {
                     socket.emit('Success', 'Socket Linked to the User');
                  }
               });
            }
         }
      });
   } else {
      socket.emit('Alert', 'Dot`t Try This Type of Hacking!');
   }
};

exports.SocketRegisterDeActive = function (socket) {
   const SocketId = socket.id;
   StemiUserModel.LoginHistorySchema.updateOne(
      {'SocketHistory.SocketId': SocketId },
      { $pull: { SocketHistory: { SocketId: SocketId } } }
   ).exec();
};

// exports.SocketUserDetails = function (socket, token, Key) {
//    const SocketId = socket.id;
//    if (token !== null && token !== '' && token !== 'null' && token !== undefined ) {
//       StemiUserModel.LoginHistorySchema
//       .findOne({LoginToken: token, 'SocketHistory.SocketId': SocketId, Active_Status: true, If_Deleted: false}, {User: 1, Hash: 1}, {})
//       .populate({ path: 'User',
//                   select: ['User_Name', 'Name', 'User_Type' , 'Location', 'Cluster', 'ClustersArray', 'Hospital', 'HospitalsArray'],
//                   populate: [ { path: 'Location', select: 'Location_Name' },
//                               { path: 'Cluster', select: 'Cluster_Name' },
//                               { path: 'Hospital', select: 'Hospital_Name' },
//                               { path: 'ClustersArray', select: 'Cluster_Name' },
//                               { path: 'HospitalsArray', select: 'Hospital_Name' } ] } )
//       .exec( function(err, res) {
//          if (err || res === null) {
//             socket.emit('Alert', 'Dot`t Try This Type of Hacking!');
//          } else {
//             socket.emit(Key, JSON.stringify(res)); 
//          }
//       });
//    } else {
//       socket.emit('Alert', 'Dot`t Try This Type of Hacking!');
//    }
   
// };

