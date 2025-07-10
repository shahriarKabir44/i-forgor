angular.module('forgor-app', []).controller('forgor-ctrl', function ($scope) {
    const STORAGE_KEY = 'todo_tasks';

    $scope.tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    $scope.newTask = '';

    $scope.addTask = function () {
        if (!$scope.newTask.trim()) return;
        $scope.tasks.push({ text: $scope.newTask.trim(), completed: false });
        $scope.newTask = '';
        $scope.saveTasks();
    };

    $scope.removeTask = function (index) {
        $scope.tasks.splice(index, 1);
        $scope.saveTasks();
    };

    $scope.saveTasks = function () {
        localStorage.setItem(STORAGE_KEY, JSON.stringify($scope.tasks));
    };

    $scope.checkEnter = function (e) {
        if (e.keyCode === 13) {
            $scope.addTask();
        }
    };
});


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js')
        .then(reg => console.log('Service Worker registered ✅', reg))
        .catch(err => console.error('Service Worker failed ❌', err));
}
