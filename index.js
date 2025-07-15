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

    $scope.distance = 0;
    $scope.checkDistance = function () {
        const d = getDistanceInKm($scope.coord, $scope.currentCoord);
        $scope.distance = d;
        return d >= 0.05
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

    $scope.vibratePhone = (pattern = [1000, 200, 1000, 200, 1000]) => {
        if (navigator.vibrate) {
            navigator.vibrate(pattern);  // Vibrate for 1 second
        } else {
            $scope.showToast("Error!", "Vibration not supported on this device.");
        }
    }
    $scope.getLocationByInterval = () => {
        let homeCoord = JSON.parse(localStorage.getItem("currentCoord"));
        if (!homeCoord) {
            $scope.showToast("Error!", "Please Select Current Location!")
            return;
        }

        setInterval(() => {
            getLocation()
                .then(coord => {
                    $scope.currentCoord = coord;

                    $scope.$apply();
                    if ($scope.checkDistance()) {
                        $scope.showToast("Alert!", "Out of the room!");
                        $scope.vibratePhone();
                        if (!$scope.hasShownPopup && $scope.tasks.length) {
                            $scope.showNotification();
                            $scope.hasShownPopup = true;
                        }

                    }

                })
                .catch(e => {
                    $scope.showToast("Location Error!", e);

                })
        }, 5000);

    }

    $scope.showNotification = () => {
        try {
            if (navigator.serviceWorker.controller) {
                navigator.serviceWorker.controller.postMessage({ type: 'SHOW_NOTIFICATION', tasks: $scope.tasks });
            }
            else {
                navigator.serviceWorker.ready.then(function (registration) {
                    console.log(registration)
                    registration.active.postMessage({ type: 'SHOW_NOTIFICATION', tasks: $scope.tasks });
                });
            }
        } catch (error) {
            alert(error.toString())
        }


    }




    $scope.storeCurrentLocation = function () {
        $scope.coord = null;
        $scope.showToast("Please Wait!", "Updating Location.");
        getLocation()
            .then(coord => {
                $scope.$apply(() => {
                    $scope.coord = coord;
                    localStorage.setItem("currentCoord", JSON.stringify(coord));
                    $scope.vibratePhone([1000]);
                    $scope.showToast("Success!", "Location Stored Successfully!");
                    $scope.getLocationByInterval();
                })



            }).catch(e => {
                $scope.showToast("Location Error!", e);

            })
    };
});
if (Notification.permission === "default") {
    Notification.requestPermission().then(function (permission) {
        if (permission === "granted") {
            console.log("Notification permission granted.");
        } else {
            console.log("Notification permission denied.");
        }
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js?v=6')
        .then(function (registration) {
            console.log(registration)
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
}

else {
    alert("No SW")
}
let deferredPrompt;
const pwaPrompt = document.getElementById("pwaPrompt");

// Listen for the 'beforeinstallprompt' event
window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent default mini-infobar
    e.preventDefault();
    deferredPrompt = e;

    // Show the floating panel
    pwaPrompt.style.display = "block";
});

// Show install prompt when user clicks "Install"
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();

        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === "accepted") {
                console.log("User accepted the install prompt.");
            } else {
                console.log("User dismissed the install prompt.");
            }

            // Hide the panel after interaction
            pwaPrompt.style.display = "none";
            deferredPrompt = null;
        });
    }
}