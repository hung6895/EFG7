function x=globa(g,H)        % C Bandt Oct. 2025
% x global point cloud of IFS, for use by scenery.m
% g,H numeration form of IFS, should fulfil H(:,3,1)=0

N=40000;    % lower bound for number of points in cloud, can be chosen 
gi=inv(g); m=size(H,3); F=H;       % calculate IFS F
for i=1:m; F(:,:,i)=gi*H(:,:,i); end 
L=ceil(log(N)/log(m));             % take min level L so that m^L>N       

x=zeros(2,(m^L-1)/(m-1)); x(:,1)=0;  
N0=1; N1=m+1; t0=1;                % determine cloud with m^L points 
for i=1:L; t1=N0:m:N1-1; 
    for j=1:m; x(:,t1+j)=F(:,1:2,j)*x(:,t0)+F(:,3,j); end
    t0=N0+1:N1; N0=N1; N1=m*N1+1;
end;  x=x(:,t0);                   % keep only last level


