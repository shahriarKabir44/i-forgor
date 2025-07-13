angular.module('forgor-app', []).controller('forgor-ctrl', function ($scope, $timeout) {
    const STORAGE_KEY = 'todo_tasks';

    $scope.tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    $scope.newTask = '';

    $scope.addTask = function () {
        if (!$scope.newTask.trim()) return;
        $scope.tasks.push({ text: $scope.newTask.trim(), completed: false, index: $scope.tasks.length });
        $scope.newTask = '';
        $scope.saveTasks();
        $scope.showToast("Success!", "Added to task list!")
    };

    $scope.removeTask = function (index) {
        $scope.tasks.splice(index, 1);
        $scope.saveTasks();
    };
    $scope.init = () => {
        $scope.tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        console.log($scope.tasks)
    }
    $scope.saveTasks = function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify($scope.tasks));
    };

    $scope.checkEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.addTask();
        }
    };
    $scope.latitude = null;
    $scope.longitude = null;
    $scope.showToaster = true;



    // Show toast function
    $scope.showToast = function (title, body) {

        $scope.toastTitle = title;
        $scope.toastMessage = body;
        $scope.isShowToast = true;
        setTimeout(() => {
            $scope.isShowToast = false;
            $scope.$apply();
        }, 3000);
    };

    $scope.hideToast = function () {
        $scope.show = false;
    };
    $scope.getLocation = function () {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                $scope.$apply(function () {
                    $scope.latitude = position.coords.latitude;
                    $scope.longitude = position.coords.longitude;
                    // Store the location (e.g., in a service or localStorage)
                    localStorage.setItem('userLatitude', $scope.latitude);
                    localStorage.setItem('userLongitude', $scope.longitude);
                    $scope.showToast("Success!", 'Location Saved!');
                });
            }, function (error) {
                console.log("Error: " + error.message);
            });
        } else {
            console.log("Geolocation is not supported by this browser.");
        }
    };
});


// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js')
//         .then(reg => console.log('Service Worker registered ✅', reg))
//         .catch(err => console.error('Service Worker failed ❌', err));
// }
