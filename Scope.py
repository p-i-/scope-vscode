# This experiment is fail!

import socket
import threading
import queue
import matplotlib.pyplot as plt
from IPython.display import display, clear_output

# Shared data structure and stop flag
data_queue = queue.Queue()
stop_flag = False
sock = None

def udp_listener():
    global stop_flag, sock
    UDP_IP = "127.0.0.1"
    UDP_PORT = 5005
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.bind((UDP_IP, UDP_PORT))

    while not stop_flag:
        data, addr = sock.recvfrom(1024)
        # print('Got', data, 'from', addr)
        data_queue.put(float(data))

    sock.close()

def plot_data():
    global stop_flag
    plt.ion()
    fig, ax = plt.subplots()
    line, = ax.plot([], [])
    ax.set_ylim(-1, 1)  # Set y-axis limits
    
    while not stop_flag:
        if not data_queue.empty():
            data = [data_queue.get() for _ in range(data_queue.qsize())]
            if len(data) > 0:
                line.set_ydata(data)
                line.set_xdata(range(len(data)))
                ax.relim()
                ax.autoscale_view(scalex=True, scaley=False)  # Keep y-axis fixed
                fig.canvas.draw()
                fig.canvas.flush_events()



def launch_visualizer(name):
    global stop_flag
    stop_flag = False
    listener_thread = threading.Thread(target=udp_listener)
    listener_thread.daemon = True
    listener_thread.start()
    
    plot_thread = threading.Thread(target=plot_data)
    plot_thread.daemon = True
    plot_thread.start()
    
    print(f"Visualizer {name} launched.")

def stop_visualizer():
    global stop_flag
    stop_flag = True
    print("Visualizer stopped.")
