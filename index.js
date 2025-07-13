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
        $scope.coord = JSON.parse(localStorage.getItem("currentCoord"));
        $scope.getLocationByInterval()
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

    $scope.beginTracking = () => {

    }

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

    function getLocation() {
        return new Promise((resolve, reject) => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function (position) {

                    resolve(position.coords)

                }, function (error) {
                    reject(error)
                });
            } else {
                reject("Geolocation is not supported by this browser.");
            }
        })
    }


    $scope.checkDistance = function () {
        const d = getDistanceInKm($scope.coord, $scope.currentCoord);
        $scope.distance = d;
        return d >= 0.01
    };

    function getDistanceInKm(stored, current) {
        const R = 6371;
        const dLat = deg2rad(current.latitude - stored.latitude);
        const dLon = deg2rad(current.longitude - stored.longitude);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(deg2rad(stored.latitude)) * Math.cos(deg2rad(current.latitude)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function deg2rad(deg) {
        return deg * (Math.PI / 180);
    }


    $scope.getLocationByInterval = () => {
        let homeCoord = JSON.parse(localStorage.getItem("currentCoord"));
        if (!homeCoord) return;

        setInterval(() => {
            getLocation()
                .then(coord => {
                    coord.accuracy = Math.floor(Math.random() * 1000)
                    $scope.currentCoord = coord;

                    $scope.$apply();
                    if ($scope.checkDistance()) {
                        $scope.showToast("Alert!", "Out of the room!");
                    }

                });
        }, 10000);

    }

    $scope.storeCurrentLocation = function () {
        getLocation()
            .then(coord => {
                $scope.coord = coord;
                localStorage.setItem("currentCoord", JSON.stringify(coord));
                $scope.$apply();
                $scope.showToast("Success!", "Location Stored Successfully!")
            })
    };
});


// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('sw.js')
//         .then(reg => console.log('Service Worker registered ✅', reg))
//         .catch(err => console.error('Service Worker failed ❌', err));
// }
