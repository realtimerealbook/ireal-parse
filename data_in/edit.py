def edit_1300(fn_in, fn_out):
    f_in = open(fn_in,"r")
    data = f_in.read()
    data = data.replace("Miles%20Davis%2C%20Bill%20Evans","Davis-Evans")
    data = data.replace("Alan%20Lerner%2C%20Burton%20Lane","Lener-Lane")
    data = data.replace("Bill%20Schluger%2C%20Peggy%20Lee","Schluger-Lee")
    data = data.replace("Thelonious%20Monk%2C%20Kenny%20Clarke","Monk-Clarke")
    data = data.replace("Leo%20Robin%20Jerome%20Kern","Robin-Kern")
    data = data.replace("Dori%20Caymmi-Nelson%20Motta","Caymmi-Motta")
    data = data.replace("Shay%20-%20Fisher%20-%20Goodwin","Shay-Fisher-Goodwin")
    f_out = open(fn_out,"w")
    f_out.write(data)

if __name__ == "__main__":
    edit_1300("data/1300_orig.txt","data/1300.txt")
