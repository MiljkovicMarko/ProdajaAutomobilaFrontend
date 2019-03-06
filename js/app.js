var app = angular.module('myApp', ['ui.bootstrap']);

app.controller('MyCtrl', function ($scope, $window, $http, $uibModal) {
  var vm = this;
  
  vm.stranice = {proizvodi: 1, mojiOglasi: 2, proizvod: 3, noviOglas: 4, izmeni: 5, prethodna: 1};
  vm.trenutnaStranica = vm.stranice.proizvodi;
  vm.noviOglas = null;
  vm.korisnik = null;
  vm.izmenjen = null;
  vm.maxID = 30;
  vm.godisteMax = 2018;
  vm.godisteMin = 0;
  vm.cenaMin = 0;
  vm.cenaMax = 100000;
  vm.minGodiste = 0;
  vm.maxCena = 100000;
  vm.searchText = "";
  vm.svi_proizvodi = [];
  vm.proizvodi = [];
  vm.korisnici = [
    {username: 'korisnik', password: 'korisnik', oglasi: [2, 4, 6]},
    {username: 'username', password: 'password', oglasi: []}
  ];

  vm.sortASC = {marka: false, model: false, cena: false, godiste: false};//za koriscenje
  vm.lastSort = 'cena';

  vm.username = '';

  vm.listaKategorija = [];
  vm.kategorijeProizvoda = {};
  vm.korpa = [];

  vm.kategorija = null;
  vm.proizvod = null;

  $scope.alerts = [
  ];

  $scope.closeAlert = function (index) {
    $scope.alerts.splice(index, 1);
  };

  vm.currentPage = 1;
  vm.itemsPerPage = 12;
  vm.totalItems = 10;
  vm.maxSize = 5;

  vm.autorizovan = false;

  vm.mojiOglasi = function () {
    vm.proizvodi = vm.svi_proizvodi.filter(sp => vm.korisnik.oglasi.some(k => sp.id === k));
    vm.totalItems = vm.proizvodi.length;
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.trenutnaStranica = vm.stranice.mojiOglasi;
  };

  vm.dodavanjeOglasa = function () {
    vm.noviOglas = {};
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.trenutnaStranica = vm.stranice.noviOglas;
  };
  vm.dodajOglas = function () {
    vm.maxID = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.id), vm.svi_proizvodi[0].id);
    vm.maxID++;
    vm.noviOglas.id = vm.maxID;
    vm.svi_proizvodi.push(angular.copy(vm.noviOglas));
    vm.korisnik.oglasi.push(vm.noviOglas.id);
    vm.noviOglas = null;
    vm.home();
  };

  vm.login = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: function ($uibModalInstance, parent) {
        var $ctrl = this;

        $ctrl.stanje = 'Login';

        vm.username = $window.localStorage.getItem("korisnik");
        $ctrl.username = vm.username;
        //$ctrl.password = parent.password;

        // funkcija koja se aktivira na dugme Login/Signin
        $ctrl.login = function () {
          const ind = vm.korisnici.findIndex(e => e.username === $ctrl.username && e.password === $ctrl.password);
          if (ind >= 0)
          {
            vm.korisnik = vm.korisnici[ind];
            $window.localStorage.setItem("korisnik", $ctrl.username);
            $uibModalInstance.close($ctrl.username);
            $scope.alerts.push({type: 'success', msg: 'Uspešno ste se prijavili!'});
          } else
          {
            $uibModalInstance.dismiss('cancel');
            $scope.alerts.push({type: 'danger', msg: 'Niste uneli ispravne podatke!'});
          }
        };

        $ctrl.register = function () {
          const ind = vm.korisnici.findIndex(e => e.username === $ctrl.username);
          if (ind === -1 && $ctrl.username.trim() !== "" && $ctrl.password.trim() !== "" && $ctrl.password === $ctrl.confirmPassword)
          {
            vm.korisnik = {username: $ctrl.username, password: $ctrl.password, oglasi: []};
            vm.korisnici.push(vm.korisnik);
            $uibModalInstance.close($ctrl.username);
            $scope.alerts.push({type: 'success', msg: 'Uspešno ste se registrovali i prijavili!'});
          } else if (ind !== -1)
          {
            $scope.alerts.push({type: 'danger', msg: 'Korisnicko ime je zauzeto!'});
          } else if ($ctrl.username.trim() === "" || $ctrl.password.trim() === "" || $ctrl.confirmPassword.trim() === "")
          {
            $scope.alerts.push({type: 'danger', msg: 'Niste popunili sva polja!'});
          } else if ($ctrl.password !== $ctrl.confirmPassword)
          {
            $scope.alerts.push({type: 'danger', msg: 'Lozinka i ponovljena lozinka se ne podudaraju!'});
          } else
          {
            $uibModalInstance.dismiss('cancel');
          }
        };

        $ctrl.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      },
      controllerAs: '$ctrl',
      resolve: {
        parent: function () {
          return vm;
        }
      }
    });

    modalInstance.result.then(function (username) {
      console.log(username);
      vm.autorizovan = true;
    }, function () {
      console.log('modal-component dismissed at: ' + new Date());
    });
  };

  vm.izmeniNalog = function () {
    var modalInstance = $uibModal.open({
      animation: true,
      templateUrl: 'myModalContent.html',
      controller: function ($uibModalInstance, parent) {
        var $ctrl = this;

        $ctrl.stanje = 'Izmeni Nalog';

        $ctrl.username = vm.korisnik.username;

        $ctrl.register = function () {
          console.log('Izmena Naloga!');
          const bezkorisnika = vm.korisnici.filter(e => e.username !== vm.korisnik.username);
          const ind = bezkorisnika.findIndex(e => e.username === $ctrl.username);
          if (ind === -1 && $ctrl.username.trim() !== "" && $ctrl.password.trim() !== "" && $ctrl.password === $ctrl.confirmPassword)
          {
            vm.korisnik = {username: $ctrl.username, password: $ctrl.password, oglasi: angular.copy(vm.korisnik.oglasi)};
            vm.korisnici = bezkorisnika;
            vm.korisnici.push(vm.korisnik);
            $uibModalInstance.close($ctrl.username);
            $scope.alerts.push({type: 'success', msg: 'Uspešno ste izmenili nalog!'});
          } else if (ind !== -1)
          {
            $scope.alerts.push({type: 'danger', msg: 'Korisnicko ime je zauzeto!'});
          } else if ($ctrl.username.trim() === "" || $ctrl.password.trim() === "" || $ctrl.confirmPassword.trim() === "")
          {
            $scope.alerts.push({type: 'danger', msg: 'Niste popunili sva polja!'});
          } else if ($ctrl.password !== $ctrl.confirmPassword)
          {
            $scope.alerts.push({type: 'danger', msg: 'Lozinka i ponovljena lozinka se ne podudaraju!'});
          } else
          {
            $uibModalInstance.dismiss('cancel');
          }
        };

        $ctrl.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      },
      controllerAs: '$ctrl',
      resolve: {
        parent: function () {
          return vm;
        }
      }
    });

    modalInstance.result.then(function (username) {
      console.log(username);
      vm.autorizovan = true;
    }, function () {
      console.log('modal-component dismissed at: ' + new Date());
    });
  };

  vm.slidersRefresh = function ()
  {
    vm.cenaMax = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.cena), vm.svi_proizvodi[0].cena);
    vm.cenaMin = vm.svi_proizvodi.reduce((a, b) => Math.min(a, b.cena), vm.svi_proizvodi[0].cena);
    vm.godisteMin = vm.svi_proizvodi.reduce((a, b) => Math.min(a, b.godiste), vm.svi_proizvodi[0].godiste);
    vm.godisteMax = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.godiste), vm.svi_proizvodi[0].godiste);
    vm.maxCena = vm.cenaMax;
    vm.minGodiste = vm.godisteMin;
  };

  vm.logout = function ()
  {
    vm.korisnik = null;
    vm.autorizovan = false;
    $window.localStorage.removeItem("korisnik");
  };

  vm.home = function () {
    vm.currentPage=1;
    vm.maxCena = 100000;
    vm.kategorija = null;
    vm.proizvod = null;
    vm.proizvodi = vm.svi_proizvodi;
    vm.maxID = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.id), vm.svi_proizvodi[0].id);
    vm.slidersRefresh();
    vm.totalItems = vm.proizvodi.length;
    vm.kategorijeProizvoda = {};
    vm.listaKategorija = [];
    for (var i in vm.svi_proizvodi) {
      var proizvod = vm.svi_proizvodi[i];
      if (!(proizvod.marka in vm.kategorijeProizvoda)) {
        vm.listaKategorija.push(proizvod.marka);
        vm.kategorijeProizvoda[proizvod.marka] = [proizvod];
      } else {
        vm.kategorijeProizvoda[proizvod.marka].push(proizvod);
      }
    }
    vm.listaKategorija.sort(function (a, b) {
      return a.localeCompare(b);
    });
    vm.trenutnaStranica = vm.stranice.proizvodi;
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.sortiraj('model', true);
    vm.sortiraj('marka', true);
  };

  vm.filtriraj = function (kategorija, maxCena, minGodiste) {
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.maxID = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.id), vm.svi_proizvodi[0].id);
    vm.trenutnaStranica = vm.stranice.proizvodi;
    if (vm.svi_proizvodi !== null && vm.svi_proizvodi.length > 0) {
      if (kategorija !== null) {
        vm.kategorija = kategorija;
        vm.proizvod = null;
        vm.proizvodi = vm.kategorijeProizvoda[kategorija];
        vm.totalItems = vm.proizvodi.length;
      } else
      {
        vm.proizvodi = vm.svi_proizvodi;
        vm.totalItems = vm.proizvodi.length;
        vm.kategorija = null;
      }
      var lista = [];
      for (var i in vm.proizvodi) {
        var proizvod = vm.proizvodi[i];
        if (proizvod.cena <= maxCena) {
          lista.push(proizvod);
        }
      }
      vm.proizvodi = lista;
      vm.totalItems = vm.proizvodi.length;
      lista = [];
      for (var i in vm.proizvodi) {
        var proizvod = vm.proizvodi[i];
        if (proizvod.godiste >= minGodiste) {
          lista.push(proizvod);
        }
      }
      vm.proizvodi = lista;
      vm.totalItems = vm.proizvodi.length;
      vm.sortiraj(vm.lastSort, vm.sortASC[vm.lastSort]);
    }
  };

  vm.sortiraj = function (katzasort, asc)
  {
    if (vm.proizvodi !== null && vm.proizvodi.length !== 0)
    {
      var zasort = katzasort.toString();
      vm.lastSort = zasort;
      vm.sortASC[zasort] = asc;
      const original=vm.proizvodi.slice(0);

      if (typeof vm.proizvodi[0][zasort] === 'string')
        if (asc)
          vm.proizvodi.sort(function (a, b) {
            const result = a[zasort] === b[zasort] ? 0 :a[zasort] < b[zasort] ?-1 : 1;
            return result === 0 ? original.indexOf(a) - original.indexOf(b) : result;
          });
        else
          vm.proizvodi.sort(function (a, b) {
            const result = a[zasort] === b[zasort] ? 0 :a[zasort] > b[zasort] ?-1 : 1;
            return result === 0 ? original.indexOf(a) - original.indexOf(b) : result;
          });
      else
      if (asc)
        vm.proizvodi.sort(function (a, b) {
          const result = a[zasort] - b[zasort];
          return result === 0 ? original.indexOf(a) - original.indexOf(b) : result;
        });
      else
        vm.proizvodi.sort(function (a, b) {
          const result = b[zasort] - a[zasort];
          return result === 0 ? original.indexOf(a) - original.indexOf(b) : result;
        });
    }
  };

  vm.selektujProizvod = function (el) {
    vm.kategorija = el.marka;
    vm.proizvod = el;
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.trenutnaStranica = vm.stranice.proizvod;
  };

  vm.izmeniProizvod = function (el) {
    vm.kategorija = el.marka;
    vm.proizvod = el;
    vm.izmenjen = angular.copy(vm.proizvod);
    //vm.stranice.prethodna=vm.trenutnaStranica;
    vm.trenutnaStranica = vm.stranice.izmeni;
  };

  vm.izmeniOglas = function () {
    vm.svi_proizvodi[vm.svi_proizvodi.findIndex(e => e.id === vm.izmenjen.id)]=angular.copy(vm.izmenjen);
    vm.home();
  };

  vm.pretrazi = function ()
  {
    vm.proizvodi = vm.svi_proizvodi.filter(p => (p.marka +" "+ p.model).toLowerCase().indexOf(vm.searchText.toLowerCase()) !== -1);
    vm.totalItems = vm.proizvodi.length;
  };

  vm.init = function () {
    vm.autorizovan = false;
    var req = {
      method: "GET",
      url: SITE+"/automobili.json"
    };
    $http(req).then(
            function (resp) {
              vm.svi_proizvodi = resp.data;
              vm.kategorijeProizvoda = {};
              vm.listaKategorija = [];
              for (var i in vm.svi_proizvodi) {
                var proizvod = vm.svi_proizvodi[i];
                if (!(proizvod.marka in vm.kategorijeProizvoda)) {
                  vm.listaKategorija.push(proizvod.marka);
                  vm.kategorijeProizvoda[proizvod.marka] = [proizvod];
                } else {
                  vm.kategorijeProizvoda[proizvod.marka].push(proizvod);
                }
              }
              vm.listaKategorija.sort(function (a, b) {
                return a.localeCompare(b);
              });
              vm.slidersRefresh();
              vm.maxID = vm.svi_proizvodi.reduce((a, b) => Math.max(a, b.id), vm.svi_proizvodi[0].id);
              vm.proizvodi = vm.svi_proizvodi;
              vm.totalItems = vm.proizvodi.length;
              vm.sortiraj('model', true);
              vm.sortiraj('marka', true);
            }, function (resp) {
      vm.message = 'error';
    });
  };

  vm.kolicina = 1;
  vm.ukupnaCena = 0;

  vm.kupi = function (el) {
    if (vm.autorizovan === true) {
      if (vm.kolicina <= el.kolicina && vm.kolicina > 0) {
        el.kolicina -= vm.kolicina;
        vm.korpa.push({proizvod: el, kolicina: vm.kolicina});
        vm.ukupnaCena += vm.kolicina * el.cena;
        $scope.alerts.push({type: 'success', msg: 'Proizvod prebacen u korpu!'});
      } else {
        $scope.alerts.push({type: 'danger', msg: 'Trazena kolicina je prevelika!'});
      }
    } else {
      vm.login();
    }
  };

  vm.obrisiProizvod = function (el) {
    if (confirm("Da li ste sigurni?")) {
      vm.svi_proizvodi = vm.svi_proizvodi.filter(e => e.id !== el.id);
      vm.home();
    }
  };

  vm.init();
});
